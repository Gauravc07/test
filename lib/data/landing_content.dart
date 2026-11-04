import 'package:flutter/material.dart';

/// Static copy for the landing page, from the original Shor site. Kept
/// separate from layout code so wording is easy to edit.

class IconItem {
  const IconItem(this.icon, this.title, this.description);

  final IconData icon;
  final String title;
  final String description;
}

class Testimonial {
  const Testimonial({
    required this.name,
    required this.role,
    required this.followers,
    required this.content,
    required this.rating,
    required this.avatar,
    required this.metric,
    required this.value,
  });

  final String name;
  final String role;
  final String followers;
  final String content;
  final int rating;
  final String avatar;
  final String metric;
  final String value;
}

class LandingContent {
  LandingContent._();

  // Hero
  static const heroBadge = 'Surveyed over 100+ creators';
  static const heroTitleLead = 'Where creators meet brands.';
  static const heroTitleStrong = 'Where brands meet impact.';
  static const heroSubtitle =
      'The most trusted collaboration hub for the influencer economy — where '
      'opportunities, insights, and relationships flow effortlessly.';
  static const streamlineTitle = 'Streamline collaborations & get paid faster.';
  static const streamlineBody =
      'Gain invaluable insights into creator performance and brand partnerships, '
      'empowering you to make data-driven decisions and close deals more effectively.';
  static const streamlinePoints = [
    'Campaign management',
    'Instant payments',
    'Brand discovery',
    'Performance analytics',
  ];
  static const trustedBy = 'Trusted by 15,000+ founders & business owners';

  // Value proposition
  static const creatorValues = [
    IconItem(
      Icons.trending_up,
      'More Brand Deals',
      'Get matched with campaigns that fit your niche and audience',
    ),
    IconItem(
      Icons.bar_chart,
      'Better Insights',
      'Track your growth with detailed analytics and performance metrics',
    ),
    IconItem(
      Icons.bolt,
      'Build Credibility',
      'Earn verified badges and climb creator levels for recognition',
    ),
  ];
  static const brandValues = [
    IconItem(
      Icons.track_changes,
      'Discover Genuine Creators',
      'AI-powered matching finds the perfect creators for your campaigns',
    ),
    IconItem(
      Icons.bolt,
      'Run Smooth Campaigns',
      'Manage everything from briefs to deliverables in one place',
    ),
    IconItem(
      Icons.bar_chart,
      'Measure ROI',
      'Track performance, engagement, and campaign success in real-time',
    ),
  ];

  // Features
  static const creatorFeatures = [
    IconItem(
      Icons.dashboard_outlined,
      'Creator Dashboard',
      'Manage your profile, categories, audience data, and portfolio all in one place.',
    ),
    IconItem(
      Icons.verified_outlined,
      'Verified Badge',
      'Earn recognition as an active or high-performing creator with our verification system.',
    ),
    IconItem(
      Icons.track_changes,
      'Brand Match Feed',
      'Discover campaigns that perfectly fit your category, location, and follower base.',
    ),
    IconItem(
      Icons.chat_bubble_outline,
      'Direct Brand Chat',
      'Communicate seamlessly with brands through integrated messaging and campaign inbox.',
    ),
    IconItem(
      Icons.bar_chart,
      'Engagement Dashboard',
      'Track your reach, engagement, audience stats, and performance trends in real-time.',
    ),
    IconItem(
      Icons.trending_up,
      'Growth Insights',
      "AI-powered summaries show what's working and what's not for your content strategy.",
    ),
  ];
  static const brandFeatures = [
    IconItem(
      Icons.search,
      'Creator Search Engine',
      'Filter by category, audience, platform, followers, and location to find perfect matches.',
    ),
    IconItem(
      Icons.auto_awesome_outlined,
      'AI Recommendations',
      'Get intelligent suggestions for ideal creators based on your campaign goals.',
    ),
    IconItem(
      Icons.description_outlined,
      'Campaign Builder',
      'Create detailed campaign briefs with budgets, deliverables, and deadlines effortlessly.',
    ),
    IconItem(
      Icons.people_outline,
      'Bulk Invites',
      'Send campaign invitations to multiple creators at once and manage responses efficiently.',
    ),
    IconItem(
      Icons.bar_chart,
      'Campaign Analytics',
      'Monitor real-time performance, reach, engagement, and cost metrics for all campaigns.',
    ),
    IconItem(
      Icons.attach_money,
      'Secure Payments',
      'Escrow-based payment flow ensures secure transactions after campaign approval.',
    ),
  ];

  // How it works
  static const creatorSteps = [
    IconItem(
      Icons.person_add_alt,
      'Sign Up & Verify',
      'Create your profile and verify your social handles to get started.',
    ),
    IconItem(
      Icons.track_changes,
      'Get Recommendations',
      'See matching campaigns tailored to your niche and audience.',
    ),
    IconItem(
      Icons.chat_bubble_outline,
      'Apply & Collaborate',
      'Chat with brands, submit your work, and manage deliverables.',
    ),
    IconItem(
      Icons.bar_chart,
      'Track Analytics',
      'View your growth, engagement metrics, and performance insights.',
    ),
    IconItem(
      Icons.card_giftcard,
      'Earn Rewards',
      'Refer creators, climb levels, and unlock exclusive perks.',
    ),
  ];
  static const brandSteps = [
    IconItem(
      Icons.business_outlined,
      'Create Brand Profile',
      'Sign up and set up your brand profile with your campaign goals.',
    ),
    IconItem(
      Icons.description_outlined,
      'Post Campaign',
      'Set category, deliverables, budget, and campaign requirements.',
    ),
    IconItem(
      Icons.people_outline,
      'Browse & Invite',
      'Shortlist creators, send invites, or accept applications.',
    ),
    IconItem(
      Icons.show_chart,
      'Monitor Campaign',
      'Track posts, engagement, ROI, and campaign performance live.',
    ),
    IconItem(
      Icons.download_outlined,
      'Download Reports',
      'Get performance summaries and export data for analysis.',
    ),
  ];

  // Testimonials
  static const testimonials = [
    Testimonial(
      name: 'Priya Sharma',
      role: 'Fashion & Lifestyle Creator',
      followers: '250K',
      content:
          'Shor has completely transformed how I work with brands. No more endless email '
          'threads or payment delays. Everything is in one place, and I get paid on time, every time.',
      rating: 5,
      avatar: 'assets/images/indian-woman-creator.jpg',
      metric: 'Campaign Success Rate',
      value: '94%',
    ),
    Testimonial(
      name: 'Arjun Mehta',
      role: 'Tech Reviewer',
      followers: '500K',
      content:
          "The analytics dashboard is a game-changer. I can show brands exactly what ROI they're "
          "getting from my content. It's helped me negotiate better rates and land bigger deals.",
      rating: 5,
      avatar: 'assets/images/indian-man-tech-reviewer.jpg',
      metric: 'Average Deal Value',
      value: '₹45,000',
    ),
    Testimonial(
      name: 'Sneha Patel',
      role: 'Food & Travel Vlogger',
      followers: '180K',
      content:
          'I used to spend hours managing collaborations across different platforms. Shor saves '
          'me at least 10 hours a week. Now I can focus on creating content instead of admin work.',
      rating: 5,
      avatar: 'assets/images/indian-woman-food-blogger.jpg',
      metric: 'Time Saved Weekly',
      value: '10 hrs',
    ),
  ];

  // Footer
  static const footerColumns = <String, List<String>>{
    'Product': ['Features', 'Pricing', 'How It Works'],
    'Company': ['About', 'Blog', 'Careers'],
    'Resources': ['Help Center', 'Community', 'Contact'],
    'Legal': ['Privacy', 'Terms'],
  };
}
