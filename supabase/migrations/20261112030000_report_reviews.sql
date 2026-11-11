-- Reviews are user-generated content, so they can be reported like
-- messages, campaigns and profiles (App Store guideline 1.2, Google Play
-- UGC policy). The report keeps a snapshot of the comment for moderators.

alter type public.report_target add value if not exists 'review';

create or replace function public.content_reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_snapshot text;
  v_user     uuid;
begin
  if v_uid is not null then
    new.reporter_id := v_uid;
  end if;
  new.status := 'open';
  new.reviewed_at := null;
  new.resolution_note := null;

  case new.target_type::text
    when 'message' then
      select m.body, m.sender_id into v_snapshot, v_user
        from public.messages m
        join public.conversations c on c.id = m.conversation_id
       where m.id = new.target_id and new.reporter_id in (c.brand_id, c.creator_id);
    when 'campaign' then
      select concat_ws(E'\n\n', c.title, c.description, c.guidelines, c.product_details), c.brand_id
        into v_snapshot, v_user
        from public.campaigns c
       where c.id = new.target_id;
    when 'collaboration' then
      select co.pitch,
             case when new.reporter_id = co.brand_id then co.creator_id else co.brand_id end
        into v_snapshot, v_user
        from public.collaborations co
       where co.id = new.target_id and new.reporter_id in (co.brand_id, co.creator_id);
    when 'user' then
      select concat_ws(E'\n\n', p.full_name, cp.handle, cp.bio, bp.company_name, bp.description), p.id
        into v_snapshot, v_user
        from public.profiles p
        left join public.creator_profiles cp on cp.id = p.id
        left join public.brand_profiles bp on bp.id = p.id
       where p.id = new.target_id;
    when 'review' then
      -- Only reviews the reporter can see (their own aren't reportable).
      select concat_ws(E'\n\n', r.rating || ' stars', r.comment), r.reviewer_id
        into v_snapshot, v_user
        from public.reviews r
       where r.id = new.target_id
         and public.review_published(r);
    else
      null;
  end case;

  if v_user is null then
    raise exception 'That content is no longer available.' using errcode = '22023';
  end if;
  if v_user = new.reporter_id then
    raise exception 'You can’t report yourself.' using errcode = '22023';
  end if;
  new.reported_user_id := v_user;
  new.content_snapshot := left(v_snapshot, 4000);
  return new;
end;
$$;
