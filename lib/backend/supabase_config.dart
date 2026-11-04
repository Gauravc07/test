/// Connection details for the Shor Supabase project.
///
/// The publishable key is meant to ship in client apps: row-level security
/// in the database decides what each user can read and write. Never put the
/// database password or a secret / service-role key here.
///
/// Both values can be overridden at build time, e.g. for a staging project:
///   flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_PUBLISHABLE_KEY=...
class SupabaseConfig {
  SupabaseConfig._();

  static const url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://tnevsivuemhlrlclpfuw.supabase.co',
  );

  static const publishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: 'sb_publishable_t2LMHb-t4WvvLaKv0-EjWg_jfDxhs58',
  );
}
