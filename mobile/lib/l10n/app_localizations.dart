import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_vi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ja'),
    Locale('vi'),
  ];

  /// web: common.save
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// web: common.cancel
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// web: common.edit
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// web: common.delete
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// web: common.saving
  ///
  /// In en, this message translates to:
  /// **'Saving…'**
  String get commonSaving;

  /// web: common.sending
  ///
  /// In en, this message translates to:
  /// **'Sending…'**
  String get commonSending;

  /// web: common.deleting
  ///
  /// In en, this message translates to:
  /// **'Deleting…'**
  String get commonDeleting;

  /// web: common.loading
  ///
  /// In en, this message translates to:
  /// **'Loading data…'**
  String get commonLoading;

  /// web: common.error
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get commonError;

  /// web: common.back
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// web: common.search
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get commonSearch;

  /// web: common.optional
  ///
  /// In en, this message translates to:
  /// **'(optional)'**
  String get commonOptional;

  /// web: common.close
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// web: common.retry
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// web: nav.appName
  ///
  /// In en, this message translates to:
  /// **'Task Management'**
  String get navAppName;

  /// web: nav.sectionOverview
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get navSectionOverview;

  /// web: nav.dashboard
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// web: nav.analytics
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get navAnalytics;

  /// web: nav.organization
  ///
  /// In en, this message translates to:
  /// **'Organization'**
  String get navOrganization;

  /// web: nav.projects
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get navProjects;

  /// web: nav.sectionFinance
  ///
  /// In en, this message translates to:
  /// **'Finance'**
  String get navSectionFinance;

  /// web: nav.transactions
  ///
  /// In en, this message translates to:
  /// **'Transactions'**
  String get navTransactions;

  /// web: nav.invoices
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get navInvoices;

  /// web: nav.payments
  ///
  /// In en, this message translates to:
  /// **'Payments'**
  String get navPayments;

  /// web: nav.sectionTeam
  ///
  /// In en, this message translates to:
  /// **'Team'**
  String get navSectionTeam;

  /// web: nav.createTeam
  ///
  /// In en, this message translates to:
  /// **'Create team'**
  String get navCreateTeam;

  /// web: nav.teamList
  ///
  /// In en, this message translates to:
  /// **'Team'**
  String get navTeamList;

  /// web: nav.members
  ///
  /// In en, this message translates to:
  /// **'Members'**
  String get navMembers;

  /// web: nav.permissions
  ///
  /// In en, this message translates to:
  /// **'Permissions'**
  String get navPermissions;

  /// web: nav.chat
  ///
  /// In en, this message translates to:
  /// **'Chat'**
  String get navChat;

  /// web: nav.meetings
  ///
  /// In en, this message translates to:
  /// **'Meetings'**
  String get navMeetings;

  /// web: nav.settings
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get navSettings;

  /// web: nav.help
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get navHelp;

  /// web: topnav.openSidebar
  ///
  /// In en, this message translates to:
  /// **'Open sidebar'**
  String get topnavOpenSidebar;

  /// web: topnav.closeSidebar
  ///
  /// In en, this message translates to:
  /// **'Close sidebar'**
  String get topnavCloseSidebar;

  /// web: topnav.breadcrumb
  ///
  /// In en, this message translates to:
  /// **'Breadcrumb'**
  String get topnavBreadcrumb;

  /// web: topnav.openUserMenu
  ///
  /// In en, this message translates to:
  /// **'Open user menu'**
  String get topnavOpenUserMenu;

  /// web: topnav.signIn
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get topnavSignIn;

  /// web: topnav.themeLight
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get topnavThemeLight;

  /// web: topnav.themeDark
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get topnavThemeDark;

  /// web: topnav.themeSystem
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get topnavThemeSystem;

  /// web: topnav.language
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get topnavLanguage;

  /// web: auth.login.title
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authLoginTitle;

  /// web: auth.login.subtitle
  ///
  /// In en, this message translates to:
  /// **'Welcome back to Task Management'**
  String get authLoginSubtitle;

  /// web: auth.login.emailLabel
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authLoginEmailLabel;

  /// web: auth.login.emailPlaceholder
  ///
  /// In en, this message translates to:
  /// **'you@taskmanagement.app'**
  String get authLoginEmailPlaceholder;

  /// web: auth.login.passwordLabel
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authLoginPasswordLabel;

  /// web: auth.login.passwordPlaceholder
  ///
  /// In en, this message translates to:
  /// **'••••••••'**
  String get authLoginPasswordPlaceholder;

  /// web: auth.login.forgotPassword
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authLoginForgotPassword;

  /// web: auth.login.showPassword
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get authLoginShowPassword;

  /// web: auth.login.hidePassword
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get authLoginHidePassword;

  /// web: auth.login.submit
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authLoginSubmit;

  /// web: auth.login.submitting
  ///
  /// In en, this message translates to:
  /// **'Signing in…'**
  String get authLoginSubmitting;

  /// web: auth.login.noAccount
  ///
  /// In en, this message translates to:
  /// **'No account yet?'**
  String get authLoginNoAccount;

  /// web: auth.login.register
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get authLoginRegister;

  /// web: auth.login.firebaseNotConfigured
  ///
  /// In en, this message translates to:
  /// **'Firebase is not configured. Create .env.local from .env.local.example.'**
  String get authLoginFirebaseNotConfigured;

  /// web: auth.login.forgotEmailPrompt
  ///
  /// In en, this message translates to:
  /// **'Enter your email above then click \"Forgot password\" to get a reset link.'**
  String get authLoginForgotEmailPrompt;

  /// web: auth.login.resetEmailSent
  ///
  /// In en, this message translates to:
  /// **'Reset email sent. Check your inbox.'**
  String get authLoginResetEmailSent;

  /// web: auth.register.title
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authRegisterTitle;

  /// web: auth.register.subtitle
  ///
  /// In en, this message translates to:
  /// **'Start managing your projects and tasks'**
  String get authRegisterSubtitle;

  /// web: auth.register.fullNameLabel
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get authRegisterFullNameLabel;

  /// web: auth.register.fullNamePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. John Doe'**
  String get authRegisterFullNamePlaceholder;

  /// web: auth.register.emailLabel
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authRegisterEmailLabel;

  /// web: auth.register.emailPlaceholder
  ///
  /// In en, this message translates to:
  /// **'you@taskmanagement.app'**
  String get authRegisterEmailPlaceholder;

  /// web: auth.register.passwordLabel
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authRegisterPasswordLabel;

  /// web: auth.register.passwordPlaceholder
  ///
  /// In en, this message translates to:
  /// **'At least 6 characters'**
  String get authRegisterPasswordPlaceholder;

  /// web: auth.register.confirmLabel
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authRegisterConfirmLabel;

  /// web: auth.register.confirmPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Re-enter password'**
  String get authRegisterConfirmPlaceholder;

  /// web: auth.register.submit
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get authRegisterSubmit;

  /// web: auth.register.submitting
  ///
  /// In en, this message translates to:
  /// **'Creating account…'**
  String get authRegisterSubmitting;

  /// web: auth.register.disclaimer
  ///
  /// In en, this message translates to:
  /// **'By creating an account, you agree to Task Management\'s Terms and Policy.'**
  String get authRegisterDisclaimer;

  /// web: auth.register.haveAccount
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get authRegisterHaveAccount;

  /// web: auth.register.login
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authRegisterLogin;

  /// web: auth.register.errors.fullNameRequired
  ///
  /// In en, this message translates to:
  /// **'Please enter your full name.'**
  String get authRegisterErrorsFullNameRequired;

  /// web: auth.register.errors.emailRequired
  ///
  /// In en, this message translates to:
  /// **'Please enter your email.'**
  String get authRegisterErrorsEmailRequired;

  /// web: auth.register.errors.passwordMinLength
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters.'**
  String get authRegisterErrorsPasswordMinLength;

  /// web: auth.register.errors.confirmMismatch
  ///
  /// In en, this message translates to:
  /// **'Password confirmation does not match.'**
  String get authRegisterErrorsConfirmMismatch;

  /// web: auth.register.errors.firebaseNotConfigured
  ///
  /// In en, this message translates to:
  /// **'Firebase is not configured. Create .env.local from .env.local.example.'**
  String get authRegisterErrorsFirebaseNotConfigured;

  /// web: auth.verify.title
  ///
  /// In en, this message translates to:
  /// **'Verify email'**
  String get authVerifyTitle;

  /// web: auth.verify.subtitle
  ///
  /// In en, this message translates to:
  /// **'We sent a verification link to'**
  String get authVerifySubtitle;

  /// web: auth.verify.instruction
  ///
  /// In en, this message translates to:
  /// **'Open the email, click the verification link, then come back here and press \'I\'ve verified\'. Don\'t forget to check Spam.'**
  String get authVerifyInstruction;

  /// web: auth.verify.checking
  ///
  /// In en, this message translates to:
  /// **'Checking…'**
  String get authVerifyChecking;

  /// web: auth.verify.iVerified
  ///
  /// In en, this message translates to:
  /// **'I\'ve verified'**
  String get authVerifyIVerified;

  /// web: auth.verify.resendCountdown
  ///
  /// In en, this message translates to:
  /// **'Resend in {seconds}s'**
  String authVerifyResendCountdown(Object seconds);

  /// web: auth.verify.resend
  ///
  /// In en, this message translates to:
  /// **'Resend verification email'**
  String get authVerifyResend;

  /// web: auth.verify.signOutAndSwitch
  ///
  /// In en, this message translates to:
  /// **'Sign out and use another account'**
  String get authVerifySignOutAndSwitch;

  /// web: auth.verify.success
  ///
  /// In en, this message translates to:
  /// **'Verified! Redirecting…'**
  String get authVerifySuccess;

  /// web: auth.verify.stillNotVerified
  ///
  /// In en, this message translates to:
  /// **'Email is still not verified. Make sure you clicked the link. If you opened it on another device, sign out and back in to refresh.'**
  String get authVerifyStillNotVerified;

  /// web: auth.verify.resent
  ///
  /// In en, this message translates to:
  /// **'Verification email re-sent. Check your inbox (and Spam).'**
  String get authVerifyResent;

  /// web: profile.statusActive
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get profileStatusActive;

  /// web: profile.statusAway
  ///
  /// In en, this message translates to:
  /// **'Away'**
  String get profileStatusAway;

  /// web: profile.statusOffline
  ///
  /// In en, this message translates to:
  /// **'Offline'**
  String get profileStatusOffline;

  /// web: profile.sectionAccount
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get profileSectionAccount;

  /// web: profile.profile
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileProfile;

  /// web: profile.settings
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get profileSettings;

  /// web: profile.notifications
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get profileNotifications;

  /// web: profile.sectionSupport
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get profileSectionSupport;

  /// web: profile.help
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get profileHelp;

  /// web: profile.terms
  ///
  /// In en, this message translates to:
  /// **'Terms & Policy'**
  String get profileTerms;

  /// web: profile.changeAvatar
  ///
  /// In en, this message translates to:
  /// **'Change avatar'**
  String get profileChangeAvatar;

  /// web: profile.signOut
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get profileSignOut;

  /// web: profile.signingOut
  ///
  /// In en, this message translates to:
  /// **'Signing out…'**
  String get profileSigningOut;

  /// web: profile.uploadFailed
  ///
  /// In en, this message translates to:
  /// **'Upload failed.'**
  String get profileUploadFailed;

  /// web: projects.guestBannerTitle
  ///
  /// In en, this message translates to:
  /// **'You are viewing in guest mode'**
  String get projectsGuestBannerTitle;

  /// web: projects.guestBannerDesc
  ///
  /// In en, this message translates to:
  /// **'Sign in to see task details for each project, create new projects, and manage your work.'**
  String get projectsGuestBannerDesc;

  /// web: projects.title
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get projectsTitle;

  /// web: projects.countLabel
  ///
  /// In en, this message translates to:
  /// **'{count} projects'**
  String projectsCountLabel(Object count);

  /// web: projects.createNew
  ///
  /// In en, this message translates to:
  /// **'New project'**
  String get projectsCreateNew;

  /// web: projects.signInToViewTitle
  ///
  /// In en, this message translates to:
  /// **'Sign in to see your projects'**
  String get projectsSignInToViewTitle;

  /// web: projects.signInToViewHelp
  ///
  /// In en, this message translates to:
  /// **'Create an account or sign in using the banner above.'**
  String get projectsSignInToViewHelp;

  /// web: projects.loading
  ///
  /// In en, this message translates to:
  /// **'Loading data…'**
  String get projectsLoading;

  /// web: projects.error
  ///
  /// In en, this message translates to:
  /// **'Error: {message}'**
  String projectsError(Object message);

  /// web: projects.emptyTitle
  ///
  /// In en, this message translates to:
  /// **'No projects yet'**
  String get projectsEmptyTitle;

  /// web: projects.emptyHelp
  ///
  /// In en, this message translates to:
  /// **'Create your first project to start managing work.'**
  String get projectsEmptyHelp;

  /// web: projects.card.tasksTotal
  ///
  /// In en, this message translates to:
  /// **'{count} tasks'**
  String projectsCardTasksTotal(Object count);

  /// web: projects.card.pendingShort
  ///
  /// In en, this message translates to:
  /// **'{count} pending'**
  String projectsCardPendingShort(Object count);

  /// web: projects.card.inProgressShort
  ///
  /// In en, this message translates to:
  /// **'{count} in progress'**
  String projectsCardInProgressShort(Object count);

  /// web: projects.card.doneShort
  ///
  /// In en, this message translates to:
  /// **'{count} done'**
  String projectsCardDoneShort(Object count);

  /// web: projects.card.progress
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get projectsCardProgress;

  /// web: projects.card.viewDetail
  ///
  /// In en, this message translates to:
  /// **'View details'**
  String get projectsCardViewDetail;

  /// web: projectDialog.createTitle
  ///
  /// In en, this message translates to:
  /// **'New project'**
  String get projectDialogCreateTitle;

  /// web: projectDialog.createDesc
  ///
  /// In en, this message translates to:
  /// **'Enter project info to start managing tasks.'**
  String get projectDialogCreateDesc;

  /// web: projectDialog.nameLabel
  ///
  /// In en, this message translates to:
  /// **'Project name'**
  String get projectDialogNameLabel;

  /// web: projectDialog.namePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. E-commerce website'**
  String get projectDialogNamePlaceholder;

  /// web: projectDialog.nameRequired
  ///
  /// In en, this message translates to:
  /// **'Project name is required.'**
  String get projectDialogNameRequired;

  /// web: projectDialog.descriptionLabel
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get projectDialogDescriptionLabel;

  /// web: projectDialog.descriptionPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Goals, scope, overall deadline…'**
  String get projectDialogDescriptionPlaceholder;

  /// web: projectDialog.thumbnailLabel
  ///
  /// In en, this message translates to:
  /// **'Thumbnail (optional)'**
  String get projectDialogThumbnailLabel;

  /// web: projectDialog.submit
  ///
  /// In en, this message translates to:
  /// **'Create project'**
  String get projectDialogSubmit;

  /// web: teamDialog.createTitle
  ///
  /// In en, this message translates to:
  /// **'Create team'**
  String get teamDialogCreateTitle;

  /// web: teamDialog.createDesc
  ///
  /// In en, this message translates to:
  /// **'Create a team to collaborate and share projects with members.'**
  String get teamDialogCreateDesc;

  /// web: teamDialog.nameLabel
  ///
  /// In en, this message translates to:
  /// **'Team name'**
  String get teamDialogNameLabel;

  /// web: teamDialog.namePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. Marketing Team'**
  String get teamDialogNamePlaceholder;

  /// web: teamDialog.nameRequired
  ///
  /// In en, this message translates to:
  /// **'Team name is required.'**
  String get teamDialogNameRequired;

  /// web: teamDialog.descriptionLabel
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get teamDialogDescriptionLabel;

  /// web: teamDialog.descriptionPlaceholder
  ///
  /// In en, this message translates to:
  /// **'What is this team about?'**
  String get teamDialogDescriptionPlaceholder;

  /// web: teamDialog.avatarLabel
  ///
  /// In en, this message translates to:
  /// **'Team avatar (optional)'**
  String get teamDialogAvatarLabel;

  /// web: teamDialog.visibilityLabel
  ///
  /// In en, this message translates to:
  /// **'Visibility'**
  String get teamDialogVisibilityLabel;

  /// web: teamDialog.visibilityPrivate
  ///
  /// In en, this message translates to:
  /// **'Private'**
  String get teamDialogVisibilityPrivate;

  /// web: teamDialog.visibilityPrivateHint
  ///
  /// In en, this message translates to:
  /// **'Only invited members can see and join.'**
  String get teamDialogVisibilityPrivateHint;

  /// web: teamDialog.visibilityPublic
  ///
  /// In en, this message translates to:
  /// **'Public'**
  String get teamDialogVisibilityPublic;

  /// web: teamDialog.visibilityPublicHint
  ///
  /// In en, this message translates to:
  /// **'Anyone in the workspace can find this team.'**
  String get teamDialogVisibilityPublicHint;

  /// web: teamDialog.inviteLabel
  ///
  /// In en, this message translates to:
  /// **'Invite members (optional)'**
  String get teamDialogInviteLabel;

  /// web: teamDialog.invitePlaceholder
  ///
  /// In en, this message translates to:
  /// **'Enter an email and press Enter'**
  String get teamDialogInvitePlaceholder;

  /// web: teamDialog.inviteHint
  ///
  /// In en, this message translates to:
  /// **'Invitations are sent by email. You can also invite later.'**
  String get teamDialogInviteHint;

  /// web: teamDialog.inviteInvalid
  ///
  /// In en, this message translates to:
  /// **'Invalid email address.'**
  String get teamDialogInviteInvalid;

  /// web: teamDialog.submit
  ///
  /// In en, this message translates to:
  /// **'Create team'**
  String get teamDialogSubmit;

  /// web: teamDialog.creating
  ///
  /// In en, this message translates to:
  /// **'Creating…'**
  String get teamDialogCreating;

  /// web: teamDialog.createError
  ///
  /// In en, this message translates to:
  /// **'Failed to create team. Please try again.'**
  String get teamDialogCreateError;

  /// web: teamsList.title
  ///
  /// In en, this message translates to:
  /// **'Teams'**
  String get teamsListTitle;

  /// web: teamsList.countLabel
  ///
  /// In en, this message translates to:
  /// **'{count} teams'**
  String teamsListCountLabel(Object count);

  /// web: teamsList.loading
  ///
  /// In en, this message translates to:
  /// **'Loading teams…'**
  String get teamsListLoading;

  /// web: teamsList.error
  ///
  /// In en, this message translates to:
  /// **'Failed to load: {message}'**
  String teamsListError(Object message);

  /// web: teamsList.emptyTitle
  ///
  /// In en, this message translates to:
  /// **'No teams yet'**
  String get teamsListEmptyTitle;

  /// web: teamsList.emptyHelp
  ///
  /// In en, this message translates to:
  /// **'Create a team using the + button in the sidebar to get started.'**
  String get teamsListEmptyHelp;

  /// web: teamsList.loadMore
  ///
  /// In en, this message translates to:
  /// **'Load more'**
  String get teamsListLoadMore;

  /// web: teamsList.loadingMore
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get teamsListLoadingMore;

  /// web: teamsList.endOfList
  ///
  /// In en, this message translates to:
  /// **'You\'ve reached the end.'**
  String get teamsListEndOfList;

  /// web: teamsList.card.membersCount
  ///
  /// In en, this message translates to:
  /// **'{count} members'**
  String teamsListCardMembersCount(Object count);

  /// web: teamsList.card.visibilityPrivate
  ///
  /// In en, this message translates to:
  /// **'Private'**
  String get teamsListCardVisibilityPrivate;

  /// web: teamsList.card.visibilityPublic
  ///
  /// In en, this message translates to:
  /// **'Public'**
  String get teamsListCardVisibilityPublic;

  /// web: teamsList.card.roleOwner
  ///
  /// In en, this message translates to:
  /// **'Owner'**
  String get teamsListCardRoleOwner;

  /// web: teamsList.card.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get teamsListCardRoleAdmin;

  /// web: teamsList.card.roleMember
  ///
  /// In en, this message translates to:
  /// **'Member'**
  String get teamsListCardRoleMember;

  /// web: teamsList.deleteAria
  ///
  /// In en, this message translates to:
  /// **'Delete team'**
  String get teamsListDeleteAria;

  /// web: teamsList.deleteTitle
  ///
  /// In en, this message translates to:
  /// **'Delete team'**
  String get teamsListDeleteTitle;

  /// web: teamsList.deleteMessage
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete the team \"{name}\"? This action cannot be undone.'**
  String teamsListDeleteMessage(Object name);

  /// web: teamsList.deleteConfirmWord
  ///
  /// In en, this message translates to:
  /// **'DELETE'**
  String get teamsListDeleteConfirmWord;

  /// web: teamsList.deleteConfirmPrompt
  ///
  /// In en, this message translates to:
  /// **'Type {word} to confirm deletion.'**
  String teamsListDeleteConfirmPrompt(Object word);

  /// web: teamsList.deletePlaceholder
  ///
  /// In en, this message translates to:
  /// **'Type {word}'**
  String teamsListDeletePlaceholder(Object word);

  /// web: teamsList.deleteSubmit
  ///
  /// In en, this message translates to:
  /// **'Delete team'**
  String get teamsListDeleteSubmit;

  /// web: teamsList.deleting
  ///
  /// In en, this message translates to:
  /// **'Deleting…'**
  String get teamsListDeleting;

  /// web: teamsList.deleteError
  ///
  /// In en, this message translates to:
  /// **'Failed to delete team. Please try again.'**
  String get teamsListDeleteError;

  /// web: membersList.title
  ///
  /// In en, this message translates to:
  /// **'Members'**
  String get membersListTitle;

  /// web: membersList.subtitle
  ///
  /// In en, this message translates to:
  /// **'All users in the system'**
  String get membersListSubtitle;

  /// web: membersList.countLabel
  ///
  /// In en, this message translates to:
  /// **'{count} users'**
  String membersListCountLabel(Object count);

  /// web: membersList.searchPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Search by name or email…'**
  String get membersListSearchPlaceholder;

  /// web: membersList.loading
  ///
  /// In en, this message translates to:
  /// **'Loading members…'**
  String get membersListLoading;

  /// web: membersList.error
  ///
  /// In en, this message translates to:
  /// **'Failed to load: {message}'**
  String membersListError(Object message);

  /// web: membersList.emptyTitle
  ///
  /// In en, this message translates to:
  /// **'No users yet'**
  String get membersListEmptyTitle;

  /// web: membersList.emptyHelp
  ///
  /// In en, this message translates to:
  /// **'There is no user data.'**
  String get membersListEmptyHelp;

  /// web: membersList.emptyHelpSearch
  ///
  /// In en, this message translates to:
  /// **'No users match your search.'**
  String get membersListEmptyHelpSearch;

  /// web: membersList.loadMore
  ///
  /// In en, this message translates to:
  /// **'Load more'**
  String get membersListLoadMore;

  /// web: membersList.loadingMore
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get membersListLoadingMore;

  /// web: membersList.endOfList
  ///
  /// In en, this message translates to:
  /// **'End of list.'**
  String get membersListEndOfList;

  /// web: membersList.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get membersListRoleAdmin;

  /// web: membersList.roleUser
  ///
  /// In en, this message translates to:
  /// **'Customer'**
  String get membersListRoleUser;

  /// web: membersList.teamCountLabel
  ///
  /// In en, this message translates to:
  /// **'{count} teams'**
  String membersListTeamCountLabel(Object count);

  /// web: membersList.verified
  ///
  /// In en, this message translates to:
  /// **'Verified'**
  String get membersListVerified;

  /// web: membersList.unverified
  ///
  /// In en, this message translates to:
  /// **'Unverified'**
  String get membersListUnverified;

  /// web: membersList.you
  ///
  /// In en, this message translates to:
  /// **'You'**
  String get membersListYou;

  /// web: membersList.actionEdit
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get membersListActionEdit;

  /// web: membersList.actionManageTeams
  ///
  /// In en, this message translates to:
  /// **'Manage teams'**
  String get membersListActionManageTeams;

  /// web: membersList.edit.title
  ///
  /// In en, this message translates to:
  /// **'Edit user'**
  String get membersListEditTitle;

  /// web: membersList.edit.desc
  ///
  /// In en, this message translates to:
  /// **'Update display name and system role.'**
  String get membersListEditDesc;

  /// web: membersList.edit.nameLabel
  ///
  /// In en, this message translates to:
  /// **'Display name'**
  String get membersListEditNameLabel;

  /// web: membersList.edit.namePlaceholder
  ///
  /// In en, this message translates to:
  /// **'Enter display name'**
  String get membersListEditNamePlaceholder;

  /// web: membersList.edit.roleLabel
  ///
  /// In en, this message translates to:
  /// **'System role'**
  String get membersListEditRoleLabel;

  /// web: membersList.edit.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get membersListEditRoleAdmin;

  /// web: membersList.edit.roleUser
  ///
  /// In en, this message translates to:
  /// **'Customer'**
  String get membersListEditRoleUser;

  /// web: membersList.edit.submit
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get membersListEditSubmit;

  /// web: membersList.edit.error
  ///
  /// In en, this message translates to:
  /// **'Update failed. Please try again.'**
  String get membersListEditError;

  /// web: membersList.teams.title
  ///
  /// In en, this message translates to:
  /// **'{name}\'s teams'**
  String membersListTeamsTitle(Object name);

  /// web: membersList.teams.desc
  ///
  /// In en, this message translates to:
  /// **'Add or remove the user from teams.'**
  String get membersListTeamsDesc;

  /// web: membersList.teams.loading
  ///
  /// In en, this message translates to:
  /// **'Loading teams…'**
  String get membersListTeamsLoading;

  /// web: membersList.teams.empty
  ///
  /// In en, this message translates to:
  /// **'This user is not in any team.'**
  String get membersListTeamsEmpty;

  /// web: membersList.teams.ownerBadge
  ///
  /// In en, this message translates to:
  /// **'Owner'**
  String get membersListTeamsOwnerBadge;

  /// web: membersList.teams.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get membersListTeamsRoleAdmin;

  /// web: membersList.teams.roleMember
  ///
  /// In en, this message translates to:
  /// **'Member'**
  String get membersListTeamsRoleMember;

  /// web: membersList.teams.remove
  ///
  /// In en, this message translates to:
  /// **'Remove from team'**
  String get membersListTeamsRemove;

  /// web: membersList.teams.removeError
  ///
  /// In en, this message translates to:
  /// **'Failed to remove from team. Please try again.'**
  String get membersListTeamsRemoveError;

  /// web: membersList.teams.removing
  ///
  /// In en, this message translates to:
  /// **'Removing…'**
  String get membersListTeamsRemoving;

  /// web: membersList.teams.addTitle
  ///
  /// In en, this message translates to:
  /// **'Add to team'**
  String get membersListTeamsAddTitle;

  /// web: membersList.teams.selectTeamLabel
  ///
  /// In en, this message translates to:
  /// **'Select team'**
  String get membersListTeamsSelectTeamLabel;

  /// web: membersList.teams.selectTeamPlaceholder
  ///
  /// In en, this message translates to:
  /// **'— Select a team —'**
  String get membersListTeamsSelectTeamPlaceholder;

  /// web: membersList.teams.searchPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Search teams…'**
  String get membersListTeamsSearchPlaceholder;

  /// web: membersList.teams.noTeams
  ///
  /// In en, this message translates to:
  /// **'No matching teams.'**
  String get membersListTeamsNoTeams;

  /// web: membersList.teams.addRoleLabel
  ///
  /// In en, this message translates to:
  /// **'Role in team'**
  String get membersListTeamsAddRoleLabel;

  /// web: membersList.teams.addRoleMember
  ///
  /// In en, this message translates to:
  /// **'Member'**
  String get membersListTeamsAddRoleMember;

  /// web: membersList.teams.addRoleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get membersListTeamsAddRoleAdmin;

  /// web: membersList.teams.addSubmit
  ///
  /// In en, this message translates to:
  /// **'Add to team'**
  String get membersListTeamsAddSubmit;

  /// web: membersList.teams.adding
  ///
  /// In en, this message translates to:
  /// **'Adding…'**
  String get membersListTeamsAdding;

  /// web: membersList.teams.addError
  ///
  /// In en, this message translates to:
  /// **'Failed to add to team. Please try again.'**
  String get membersListTeamsAddError;

  /// web: teamDetail.loading
  ///
  /// In en, this message translates to:
  /// **'Loading team…'**
  String get teamDetailLoading;

  /// web: teamDetail.error
  ///
  /// In en, this message translates to:
  /// **'Failed to load: {message}'**
  String teamDetailError(Object message);

  /// web: teamDetail.notFound
  ///
  /// In en, this message translates to:
  /// **'Team not found.'**
  String get teamDetailNotFound;

  /// web: teamDetail.visibilityPrivate
  ///
  /// In en, this message translates to:
  /// **'Private'**
  String get teamDetailVisibilityPrivate;

  /// web: teamDetail.visibilityPublic
  ///
  /// In en, this message translates to:
  /// **'Public'**
  String get teamDetailVisibilityPublic;

  /// web: teamDetail.membersTitle
  ///
  /// In en, this message translates to:
  /// **'Members'**
  String get teamDetailMembersTitle;

  /// web: teamDetail.membersCount
  ///
  /// In en, this message translates to:
  /// **'{count} members'**
  String teamDetailMembersCount(Object count);

  /// web: teamDetail.roleOwner
  ///
  /// In en, this message translates to:
  /// **'Owner'**
  String get teamDetailRoleOwner;

  /// web: teamDetail.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get teamDetailRoleAdmin;

  /// web: teamDetail.roleMember
  ///
  /// In en, this message translates to:
  /// **'Member'**
  String get teamDetailRoleMember;

  /// web: teamDetail.you
  ///
  /// In en, this message translates to:
  /// **'You'**
  String get teamDetailYou;

  /// web: teamDetail.makeAdmin
  ///
  /// In en, this message translates to:
  /// **'Make admin'**
  String get teamDetailMakeAdmin;

  /// web: teamDetail.makeMember
  ///
  /// In en, this message translates to:
  /// **'Set as member'**
  String get teamDetailMakeMember;

  /// web: teamDetail.removeMember
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get teamDetailRemoveMember;

  /// web: teamDetail.removeConfirm
  ///
  /// In en, this message translates to:
  /// **'Remove this member from the team?'**
  String get teamDetailRemoveConfirm;

  /// web: teamDetail.leaveTeam
  ///
  /// In en, this message translates to:
  /// **'Leave team'**
  String get teamDetailLeaveTeam;

  /// web: teamDetail.leaveConfirm
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to leave this team?'**
  String get teamDetailLeaveConfirm;

  /// web: teamDetail.inviteTitle
  ///
  /// In en, this message translates to:
  /// **'Add / invite members'**
  String get teamDetailInviteTitle;

  /// web: teamDetail.invitePlaceholder
  ///
  /// In en, this message translates to:
  /// **'Enter an email and press Enter'**
  String get teamDetailInvitePlaceholder;

  /// web: teamDetail.inviteHint
  ///
  /// In en, this message translates to:
  /// **'Invitations are sent by email. Added emails appear as pending below.'**
  String get teamDetailInviteHint;

  /// web: teamDetail.inviteSubmit
  ///
  /// In en, this message translates to:
  /// **'Send invites'**
  String get teamDetailInviteSubmit;

  /// web: teamDetail.inviteSending
  ///
  /// In en, this message translates to:
  /// **'Sending…'**
  String get teamDetailInviteSending;

  /// web: teamDetail.inviteInvalid
  ///
  /// In en, this message translates to:
  /// **'Invalid email address.'**
  String get teamDetailInviteInvalid;

  /// web: teamDetail.inviteError
  ///
  /// In en, this message translates to:
  /// **'Failed to send invites. Please try again.'**
  String get teamDetailInviteError;

  /// web: teamDetail.pendingTitle
  ///
  /// In en, this message translates to:
  /// **'Pending invites'**
  String get teamDetailPendingTitle;

  /// web: teamDetail.pendingEmpty
  ///
  /// In en, this message translates to:
  /// **'No pending invites.'**
  String get teamDetailPendingEmpty;

  /// web: teamDetail.statusPending
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get teamDetailStatusPending;

  /// web: teamDetail.cancelInvite
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get teamDetailCancelInvite;

  /// web: teamDetail.projectsTitle
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get teamDetailProjectsTitle;

  /// web: teamDetail.projectsEmpty
  ///
  /// In en, this message translates to:
  /// **'No projects assigned to this team yet.'**
  String get teamDetailProjectsEmpty;

  /// web: teamDetail.addProject
  ///
  /// In en, this message translates to:
  /// **'Add project'**
  String get teamDetailAddProject;

  /// web: teamDetail.removeProject
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get teamDetailRemoveProject;

  /// web: teamDetail.removeProjectConfirm
  ///
  /// In en, this message translates to:
  /// **'Remove this project from the team?'**
  String get teamDetailRemoveProjectConfirm;

  /// web: teamDetail.addProjectTitle
  ///
  /// In en, this message translates to:
  /// **'Add project to team'**
  String get teamDetailAddProjectTitle;

  /// web: teamDetail.addProjectDesc
  ///
  /// In en, this message translates to:
  /// **'Choose one of your projects to add to this team.'**
  String get teamDetailAddProjectDesc;

  /// web: teamDetail.addProjectEmpty
  ///
  /// In en, this message translates to:
  /// **'You have no projects available to add.'**
  String get teamDetailAddProjectEmpty;

  /// web: teamDetail.addProjectSubmit
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get teamDetailAddProjectSubmit;

  /// web: teamDetail.addingProject
  ///
  /// In en, this message translates to:
  /// **'Adding…'**
  String get teamDetailAddingProject;

  /// web: teamDetail.addProjectError
  ///
  /// In en, this message translates to:
  /// **'Failed to add project. Please try again.'**
  String get teamDetailAddProjectError;

  /// web: invitePage.title
  ///
  /// In en, this message translates to:
  /// **'Team invitation'**
  String get invitePageTitle;

  /// web: invitePage.description
  ///
  /// In en, this message translates to:
  /// **'You\'ve been invited to join a team. Accept to become a member.'**
  String get invitePageDescription;

  /// web: invitePage.missingToken
  ///
  /// In en, this message translates to:
  /// **'Invalid or missing invitation link.'**
  String get invitePageMissingToken;

  /// web: invitePage.signInRequired
  ///
  /// In en, this message translates to:
  /// **'Please sign in to accept this invitation.'**
  String get invitePageSignInRequired;

  /// web: invitePage.signInButton
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get invitePageSignInButton;

  /// web: invitePage.accept
  ///
  /// In en, this message translates to:
  /// **'Accept invitation'**
  String get invitePageAccept;

  /// web: invitePage.accepting
  ///
  /// In en, this message translates to:
  /// **'Accepting…'**
  String get invitePageAccepting;

  /// web: invitePage.successTitle
  ///
  /// In en, this message translates to:
  /// **'You\'ve joined the team!'**
  String get invitePageSuccessTitle;

  /// web: invitePage.successDesc
  ///
  /// In en, this message translates to:
  /// **'You are now a member of this team.'**
  String get invitePageSuccessDesc;

  /// web: invitePage.goToTeam
  ///
  /// In en, this message translates to:
  /// **'Go to team'**
  String get invitePageGoToTeam;

  /// web: invitePage.errorTitle
  ///
  /// In en, this message translates to:
  /// **'Could not accept invitation'**
  String get invitePageErrorTitle;

  /// web: invitePage.backToTeams
  ///
  /// In en, this message translates to:
  /// **'Back to teams'**
  String get invitePageBackToTeams;

  /// web: tasks.title
  ///
  /// In en, this message translates to:
  /// **'Task Manager'**
  String get tasksTitle;

  /// web: tasks.createNew
  ///
  /// In en, this message translates to:
  /// **'New task'**
  String get tasksCreateNew;

  /// web: tasks.createShort
  ///
  /// In en, this message translates to:
  /// **'New task'**
  String get tasksCreateShort;

  /// web: tasks.filterAll
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get tasksFilterAll;

  /// web: tasks.searchPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Search tasks by name, tag, assignee…'**
  String get tasksSearchPlaceholder;

  /// web: tasks.loading
  ///
  /// In en, this message translates to:
  /// **'Loading data…'**
  String get tasksLoading;

  /// web: tasks.errorPrefix
  ///
  /// In en, this message translates to:
  /// **'Error: {message}'**
  String tasksErrorPrefix(Object message);

  /// web: tasks.emptyTitle
  ///
  /// In en, this message translates to:
  /// **'No tasks'**
  String get tasksEmptyTitle;

  /// web: tasks.emptyHelp
  ///
  /// In en, this message translates to:
  /// **'Create your first task to start managing your work.'**
  String get tasksEmptyHelp;

  /// web: tasks.emptyHelpSearch
  ///
  /// In en, this message translates to:
  /// **'Try a different keyword or clear filters.'**
  String get tasksEmptyHelpSearch;

  /// web: tasks.status.pending
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get tasksStatusPending;

  /// web: tasks.status.inProgress
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get tasksStatusInProgress;

  /// web: tasks.status.completed
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get tasksStatusCompleted;

  /// web: tasks.priority.label
  ///
  /// In en, this message translates to:
  /// **'Priority: {value}'**
  String tasksPriorityLabel(Object value);

  /// web: tasks.priority.low
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get tasksPriorityLow;

  /// web: tasks.priority.medium
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get tasksPriorityMedium;

  /// web: tasks.priority.high
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get tasksPriorityHigh;

  /// web: taskDialog.createTitle
  ///
  /// In en, this message translates to:
  /// **'New task'**
  String get taskDialogCreateTitle;

  /// web: taskDialog.editTitle
  ///
  /// In en, this message translates to:
  /// **'Edit task'**
  String get taskDialogEditTitle;

  /// web: taskDialog.description
  ///
  /// In en, this message translates to:
  /// **'Enter the task details.'**
  String get taskDialogDescription;

  /// web: taskDialog.noLabel
  ///
  /// In en, this message translates to:
  /// **'Number'**
  String get taskDialogNoLabel;

  /// web: taskDialog.noPlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. 6'**
  String get taskDialogNoPlaceholder;

  /// web: taskDialog.noRequired
  ///
  /// In en, this message translates to:
  /// **'Number is required.'**
  String get taskDialogNoRequired;

  /// web: taskDialog.noInvalid
  ///
  /// In en, this message translates to:
  /// **'Number must be a positive integer.'**
  String get taskDialogNoInvalid;

  /// web: taskDialog.noMustGtZero
  ///
  /// In en, this message translates to:
  /// **'Number must be greater than 0.'**
  String get taskDialogNoMustGtZero;

  /// web: taskDialog.noDuplicate
  ///
  /// In en, this message translates to:
  /// **'Number #{value} already exists in this project.'**
  String taskDialogNoDuplicate(Object value);

  /// web: taskDialog.noHint
  ///
  /// In en, this message translates to:
  /// **'Suggested: #{value}'**
  String taskDialogNoHint(Object value);

  /// web: taskDialog.titleLabel
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get taskDialogTitleLabel;

  /// web: taskDialog.titlePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. Finish weekly report'**
  String get taskDialogTitlePlaceholder;

  /// web: taskDialog.titleRequired
  ///
  /// In en, this message translates to:
  /// **'Title is required.'**
  String get taskDialogTitleRequired;

  /// web: taskDialog.descriptionLabel
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get taskDialogDescriptionLabel;

  /// web: taskDialog.descriptionPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Work details, notes…'**
  String get taskDialogDescriptionPlaceholder;

  /// web: taskDialog.statusLabel
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get taskDialogStatusLabel;

  /// web: taskDialog.priorityLabel
  ///
  /// In en, this message translates to:
  /// **'Priority'**
  String get taskDialogPriorityLabel;

  /// web: taskDialog.startDateLabel
  ///
  /// In en, this message translates to:
  /// **'Start date'**
  String get taskDialogStartDateLabel;

  /// web: taskDialog.dueDateLabel
  ///
  /// In en, this message translates to:
  /// **'Due date'**
  String get taskDialogDueDateLabel;

  /// web: taskDialog.assigneeLabel
  ///
  /// In en, this message translates to:
  /// **'Assignee'**
  String get taskDialogAssigneeLabel;

  /// web: taskDialog.assigneePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. John'**
  String get taskDialogAssigneePlaceholder;

  /// web: taskDialog.tagsLabel
  ///
  /// In en, this message translates to:
  /// **'Tags (comma separated)'**
  String get taskDialogTagsLabel;

  /// web: taskDialog.tagsPlaceholder
  ///
  /// In en, this message translates to:
  /// **'backend, urgent'**
  String get taskDialogTagsPlaceholder;

  /// web: taskDialog.thumbnailLabel
  ///
  /// In en, this message translates to:
  /// **'Thumbnail (optional)'**
  String get taskDialogThumbnailLabel;

  /// web: taskDialog.submitCreate
  ///
  /// In en, this message translates to:
  /// **'Create task'**
  String get taskDialogSubmitCreate;

  /// web: taskDialog.submitEdit
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get taskDialogSubmitEdit;

  /// web: taskItem.ariaNumber
  ///
  /// In en, this message translates to:
  /// **'Task number {value}'**
  String taskItemAriaNumber(Object value);

  /// web: taskItem.ariaComments
  ///
  /// In en, this message translates to:
  /// **'{count} comments'**
  String taskItemAriaComments(Object count);

  /// web: taskItem.ariaEdit
  ///
  /// In en, this message translates to:
  /// **'Edit task'**
  String get taskItemAriaEdit;

  /// web: taskItem.ariaDelete
  ///
  /// In en, this message translates to:
  /// **'Delete task'**
  String get taskItemAriaDelete;

  /// web: taskDetail.back
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get taskDetailBack;

  /// web: taskDetail.edit
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get taskDetailEdit;

  /// web: taskDetail.delete
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get taskDetailDelete;

  /// web: taskDetail.assignee
  ///
  /// In en, this message translates to:
  /// **'Assignee:'**
  String get taskDetailAssignee;

  /// web: taskDetail.startDate
  ///
  /// In en, this message translates to:
  /// **'Start:'**
  String get taskDetailStartDate;

  /// web: taskDetail.dueDate
  ///
  /// In en, this message translates to:
  /// **'Due:'**
  String get taskDetailDueDate;

  /// web: taskDetail.overdue
  ///
  /// In en, this message translates to:
  /// **'Overdue'**
  String get taskDetailOverdue;

  /// web: taskDetail.tags
  ///
  /// In en, this message translates to:
  /// **'Tags:'**
  String get taskDetailTags;

  /// web: taskDetail.descriptionHeading
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get taskDetailDescriptionHeading;

  /// web: taskDetail.noDescription
  ///
  /// In en, this message translates to:
  /// **'No description yet.'**
  String get taskDetailNoDescription;

  /// web: taskDetail.priorityWithLabel
  ///
  /// In en, this message translates to:
  /// **'Priority: {value}'**
  String taskDetailPriorityWithLabel(Object value);

  /// web: taskDetail.deleteConfirm
  ///
  /// In en, this message translates to:
  /// **'Delete this task?'**
  String get taskDetailDeleteConfirm;

  /// web: comments.title
  ///
  /// In en, this message translates to:
  /// **'Comments'**
  String get commentsTitle;

  /// web: comments.yourComment
  ///
  /// In en, this message translates to:
  /// **'Your comment'**
  String get commentsYourComment;

  /// web: comments.placeholder
  ///
  /// In en, this message translates to:
  /// **'Write a comment…'**
  String get commentsPlaceholder;

  /// web: comments.attach
  ///
  /// In en, this message translates to:
  /// **'Attach'**
  String get commentsAttach;

  /// web: comments.attachOnlyFallback
  ///
  /// In en, this message translates to:
  /// **'(attachment)'**
  String get commentsAttachOnlyFallback;

  /// web: comments.userFallback
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get commentsUserFallback;

  /// web: comments.removeFile
  ///
  /// In en, this message translates to:
  /// **'Remove file {name}'**
  String commentsRemoveFile(Object name);

  /// web: comments.maxPerComment
  ///
  /// In en, this message translates to:
  /// **'Maximum {count} files per comment.'**
  String commentsMaxPerComment(Object count);

  /// web: comments.loading
  ///
  /// In en, this message translates to:
  /// **'Loading comments…'**
  String get commentsLoading;

  /// web: comments.empty
  ///
  /// In en, this message translates to:
  /// **'No comments yet. Be the first!'**
  String get commentsEmpty;

  /// web: comments.reply
  ///
  /// In en, this message translates to:
  /// **'Reply'**
  String get commentsReply;

  /// web: comments.edit
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commentsEdit;

  /// web: comments.delete
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commentsDelete;

  /// web: comments.deleteConfirm
  ///
  /// In en, this message translates to:
  /// **'Delete this comment?'**
  String get commentsDeleteConfirm;

  /// web: comments.send
  ///
  /// In en, this message translates to:
  /// **'Send comment'**
  String get commentsSend;

  /// web: comments.sending
  ///
  /// In en, this message translates to:
  /// **'Sending…'**
  String get commentsSending;

  /// web: comments.sendReply
  ///
  /// In en, this message translates to:
  /// **'Send reply'**
  String get commentsSendReply;

  /// web: comments.replyingTo
  ///
  /// In en, this message translates to:
  /// **'Replying to @{name}'**
  String commentsReplyingTo(Object name);

  /// web: comments.replyPlaceholder
  ///
  /// In en, this message translates to:
  /// **'Reply to @{name}…'**
  String commentsReplyPlaceholder(Object name);

  /// web: comments.cancel
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commentsCancel;

  /// web: comments.save
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commentsSave;

  /// web: comments.edited
  ///
  /// In en, this message translates to:
  /// **' (edited)'**
  String get commentsEdited;

  /// web: comments.openPdfTitle
  ///
  /// In en, this message translates to:
  /// **'Open PDF in new tab'**
  String get commentsOpenPdfTitle;

  /// web: comments.downloadTitle
  ///
  /// In en, this message translates to:
  /// **'Download: {name} ({size})'**
  String commentsDownloadTitle(Object name, Object size);

  /// web: attachments.errorEmpty
  ///
  /// In en, this message translates to:
  /// **'File \"{name}\" is empty.'**
  String attachmentsErrorEmpty(Object name);

  /// web: attachments.errorTooLarge
  ///
  /// In en, this message translates to:
  /// **'File \"{name}\" exceeds the {limit}MB limit.'**
  String attachmentsErrorTooLarge(Object name, Object limit);

  /// web: attachments.errorBlocked
  ///
  /// In en, this message translates to:
  /// **'Extension .{ext} is not allowed.'**
  String attachmentsErrorBlocked(Object ext);

  /// web: attachments.errorUnsupported
  ///
  /// In en, this message translates to:
  /// **'Extension .{ext} is not supported.'**
  String attachmentsErrorUnsupported(Object ext);

  /// web: attachments.errorBadMime
  ///
  /// In en, this message translates to:
  /// **'MIME \"{mime}\" of file \"{name}\" is not supported.'**
  String attachmentsErrorBadMime(Object mime, Object name);

  /// web: fileInput.pickImage
  ///
  /// In en, this message translates to:
  /// **'Pick image'**
  String get fileInputPickImage;

  /// web: fileInput.changeImage
  ///
  /// In en, this message translates to:
  /// **'Change image'**
  String get fileInputChangeImage;

  /// web: fileInput.clear
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get fileInputClear;

  /// web: fileInput.helper
  ///
  /// In en, this message translates to:
  /// **'JPG/PNG/WEBP/GIF, max 5MB'**
  String get fileInputHelper;

  /// web: fileInput.errorInvalidType
  ///
  /// In en, this message translates to:
  /// **'Only JPG/PNG/WEBP/GIF supported.'**
  String get fileInputErrorInvalidType;

  /// web: fileInput.errorTooLarge
  ///
  /// In en, this message translates to:
  /// **'File too large (max 5MB).'**
  String get fileInputErrorTooLarge;

  /// web: imageLightbox.close
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get imageLightboxClose;

  /// web: settings.title
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// web: settings.subtitle
  ///
  /// In en, this message translates to:
  /// **'Manage your appearance and language preferences.'**
  String get settingsSubtitle;

  /// web: settings.sectionAppearance
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get settingsSectionAppearance;

  /// web: settings.theme
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get settingsTheme;

  /// web: settings.themeLight
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get settingsThemeLight;

  /// web: settings.themeDark
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get settingsThemeDark;

  /// web: settings.themeSystem
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get settingsThemeSystem;

  /// web: settings.sectionLanguage
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsSectionLanguage;

  /// web: settings.language
  ///
  /// In en, this message translates to:
  /// **'Display language'**
  String get settingsLanguage;

  /// web: settings.languageHelp
  ///
  /// In en, this message translates to:
  /// **'Choose the language used across the interface.'**
  String get settingsLanguageHelp;

  /// web: languages.en
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languagesEn;

  /// web: languages.vi
  ///
  /// In en, this message translates to:
  /// **'Tiếng Việt'**
  String get languagesVi;

  /// web: languages.ja
  ///
  /// In en, this message translates to:
  /// **'日本語'**
  String get languagesJa;

  /// web: breadcrumbs.dashboard
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get breadcrumbsDashboard;

  /// web: breadcrumbs.projectFallback
  ///
  /// In en, this message translates to:
  /// **'Project'**
  String get breadcrumbsProjectFallback;

  /// web: breadcrumbs.taskFallback
  ///
  /// In en, this message translates to:
  /// **'Task'**
  String get breadcrumbsTaskFallback;

  /// web: breadcrumbs.task
  ///
  /// In en, this message translates to:
  /// **'Task'**
  String get breadcrumbsTask;

  /// web: breadcrumbs.settings
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get breadcrumbsSettings;

  /// web: pages.task.loading
  ///
  /// In en, this message translates to:
  /// **'Loading task…'**
  String get pagesTaskLoading;

  /// web: pages.task.errorFallback
  ///
  /// In en, this message translates to:
  /// **'Could not load task.'**
  String get pagesTaskErrorFallback;

  /// web: taskImages.label
  ///
  /// In en, this message translates to:
  /// **'Images'**
  String get taskImagesLabel;

  /// web: taskImages.hint
  ///
  /// In en, this message translates to:
  /// **'Drag to reorder · The first image is the cover'**
  String get taskImagesHint;

  /// web: taskImages.cover
  ///
  /// In en, this message translates to:
  /// **'Cover'**
  String get taskImagesCover;

  /// web: taskImages.setCover
  ///
  /// In en, this message translates to:
  /// **'Set as cover'**
  String get taskImagesSetCover;

  /// web: taskImages.remove
  ///
  /// In en, this message translates to:
  /// **'Remove image'**
  String get taskImagesRemove;

  /// web: taskImages.add
  ///
  /// In en, this message translates to:
  /// **'Add images'**
  String get taskImagesAdd;

  /// web: taskImages.addHint
  ///
  /// In en, this message translates to:
  /// **'Drop or click'**
  String get taskImagesAddHint;

  /// web: taskImages.limitReached
  ///
  /// In en, this message translates to:
  /// **'Limit of {count} images reached'**
  String taskImagesLimitReached(Object count);

  /// web: taskImages.tooLarge
  ///
  /// In en, this message translates to:
  /// **'{name}: larger than 5MB'**
  String taskImagesTooLarge(Object name);

  /// web: taskImages.badType
  ///
  /// In en, this message translates to:
  /// **'{name}: unsupported format (JPG/PNG/WEBP/GIF)'**
  String taskImagesBadType(Object name);

  /// web: taskImages.tooMany
  ///
  /// In en, this message translates to:
  /// **'You can add at most {count} more images'**
  String taskImagesTooMany(Object count);

  /// web: taskImages.uploading
  ///
  /// In en, this message translates to:
  /// **'Uploading images {done}/{total}…'**
  String taskImagesUploading(Object done, Object total);

  /// web: taskImages.uploadFailed
  ///
  /// In en, this message translates to:
  /// **'{count} images failed to upload. The task was saved — you can add them again later.'**
  String taskImagesUploadFailed(Object count);

  /// web: taskImages.close
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get taskImagesClose;

  /// web: taskImages.prev
  ///
  /// In en, this message translates to:
  /// **'Previous image'**
  String get taskImagesPrev;

  /// web: taskImages.next
  ///
  /// In en, this message translates to:
  /// **'Next image'**
  String get taskImagesNext;

  /// web: taskImages.openFull
  ///
  /// In en, this message translates to:
  /// **'View full screen'**
  String get taskImagesOpenFull;

  /// web: taskImages.imageCount
  ///
  /// In en, this message translates to:
  /// **'{count} images'**
  String taskImagesImageCount(Object count);

  /// web: mobile.notificationsSubtitle
  ///
  /// In en, this message translates to:
  /// **'Updates about tasks in your projects.'**
  String get mobileNotificationsSubtitle;

  /// web: mobile.notificationsAssigned
  ///
  /// In en, this message translates to:
  /// **'Assigned to you'**
  String get mobileNotificationsAssigned;

  /// web: mobile.notificationsEmpty
  ///
  /// In en, this message translates to:
  /// **'No new notifications.'**
  String get mobileNotificationsEmpty;

  /// web: mobile.configMissingTitle
  ///
  /// In en, this message translates to:
  /// **'Firebase configuration missing'**
  String get mobileConfigMissingTitle;

  /// web: mobile.configMissingDesc
  ///
  /// In en, this message translates to:
  /// **'Run the app with --dart-define-from-file=config/firebase.json (see mobile/README.md).'**
  String get mobileConfigMissingDesc;

  /// web: mobile.openFile
  ///
  /// In en, this message translates to:
  /// **'Open file'**
  String get mobileOpenFile;

  /// web: mobile.pickFromGallery
  ///
  /// In en, this message translates to:
  /// **'Choose from library'**
  String get mobilePickFromGallery;

  /// web: mobile.takePhoto
  ///
  /// In en, this message translates to:
  /// **'Take photo'**
  String get mobileTakePhoto;

  /// web: mobile.pickFiles
  ///
  /// In en, this message translates to:
  /// **'Choose files'**
  String get mobilePickFiles;

  /// web: mobile.profileTitle
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get mobileProfileTitle;

  /// web: access.roleAdmin
  ///
  /// In en, this message translates to:
  /// **'Administrator'**
  String get accessRoleAdmin;

  /// web: access.roleCustomer
  ///
  /// In en, this message translates to:
  /// **'Customer'**
  String get accessRoleCustomer;

  /// web: access.noPermissionTitle
  ///
  /// In en, this message translates to:
  /// **'You don\'t have access to this page'**
  String get accessNoPermissionTitle;

  /// web: access.noPermissionDesc
  ///
  /// In en, this message translates to:
  /// **'This page is for administrators only. If you need access, please contact your administrator.'**
  String get accessNoPermissionDesc;

  /// web: access.backToDashboard
  ///
  /// In en, this message translates to:
  /// **'Back to Dashboard'**
  String get accessBackToDashboard;

  /// web: access.deniedLogin
  ///
  /// In en, this message translates to:
  /// **'Your account has not been granted access or has been locked.'**
  String get accessDeniedLogin;

  /// web: access.contactAdmin
  ///
  /// In en, this message translates to:
  /// **'Please contact your administrator for help.'**
  String get accessContactAdmin;

  /// web: access.createAccount
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get accessCreateAccount;

  /// web: access.createTitle
  ///
  /// In en, this message translates to:
  /// **'Create a new account'**
  String get accessCreateTitle;

  /// web: access.createDesc
  ///
  /// In en, this message translates to:
  /// **'The user will receive an email with a link to set their password.'**
  String get accessCreateDesc;

  /// web: access.emailLabel
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get accessEmailLabel;

  /// web: access.emailPlaceholder
  ///
  /// In en, this message translates to:
  /// **'customer@company.com'**
  String get accessEmailPlaceholder;

  /// web: access.nameLabel
  ///
  /// In en, this message translates to:
  /// **'Display name'**
  String get accessNameLabel;

  /// web: access.namePlaceholder
  ///
  /// In en, this message translates to:
  /// **'e.g. John Smith'**
  String get accessNamePlaceholder;

  /// web: access.roleLabel
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get accessRoleLabel;

  /// web: access.roleCustomerHint
  ///
  /// In en, this message translates to:
  /// **'Sees assigned projects only'**
  String get accessRoleCustomerHint;

  /// web: access.roleAdminHint
  ///
  /// In en, this message translates to:
  /// **'Full system access'**
  String get accessRoleAdminHint;

  /// web: access.projectsLabel
  ///
  /// In en, this message translates to:
  /// **'Project access'**
  String get accessProjectsLabel;

  /// web: access.projectsHint
  ///
  /// In en, this message translates to:
  /// **'Customers can only see the projects selected here.'**
  String get accessProjectsHint;

  /// web: access.noProjectsAvailable
  ///
  /// In en, this message translates to:
  /// **'No projects yet.'**
  String get accessNoProjectsAvailable;

  /// web: access.creating
  ///
  /// In en, this message translates to:
  /// **'Creating…'**
  String get accessCreating;

  /// web: access.createSubmit
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get accessCreateSubmit;

  /// web: access.createError
  ///
  /// In en, this message translates to:
  /// **'Could not create the account.'**
  String get accessCreateError;

  /// web: access.createdTitle
  ///
  /// In en, this message translates to:
  /// **'Account created'**
  String get accessCreatedTitle;

  /// web: access.createdEmailSent
  ///
  /// In en, this message translates to:
  /// **'A set-password email has been sent to {email}.'**
  String accessCreatedEmailSent(Object email);

  /// web: access.createdEmailFailed
  ///
  /// In en, this message translates to:
  /// **'Could not send email to {email}. Copy the link below and send it to the user.'**
  String accessCreatedEmailFailed(Object email);

  /// web: access.setPasswordLink
  ///
  /// In en, this message translates to:
  /// **'Set-password link'**
  String get accessSetPasswordLink;

  /// web: access.copy
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get accessCopy;

  /// web: access.copied
  ///
  /// In en, this message translates to:
  /// **'Copied'**
  String get accessCopied;

  /// web: access.done
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get accessDone;

  /// web: access.actionProjects
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get accessActionProjects;

  /// web: access.actionLock
  ///
  /// In en, this message translates to:
  /// **'Lock'**
  String get accessActionLock;

  /// web: access.actionUnlock
  ///
  /// In en, this message translates to:
  /// **'Unlock'**
  String get accessActionUnlock;

  /// web: access.actionResendLink
  ///
  /// In en, this message translates to:
  /// **'Resend link'**
  String get accessActionResendLink;

  /// web: access.lockConfirm
  ///
  /// In en, this message translates to:
  /// **'Lock account {email}? The user won\'t be able to sign in until unlocked.'**
  String accessLockConfirm(Object email);

  /// web: access.unlockConfirm
  ///
  /// In en, this message translates to:
  /// **'Unlock account {email}?'**
  String accessUnlockConfirm(Object email);

  /// web: access.statusDisabled
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get accessStatusDisabled;

  /// web: access.projectCountLabel
  ///
  /// In en, this message translates to:
  /// **'{count} projects'**
  String accessProjectCountLabel(Object count);

  /// web: access.resendTitle
  ///
  /// In en, this message translates to:
  /// **'New set-password link'**
  String get accessResendTitle;

  /// web: access.resendError
  ///
  /// In en, this message translates to:
  /// **'Could not create a set-password link.'**
  String get accessResendError;

  /// web: access.userProjectsTitle
  ///
  /// In en, this message translates to:
  /// **'Projects of {name}'**
  String accessUserProjectsTitle(Object name);

  /// web: access.userProjectsDesc
  ///
  /// In en, this message translates to:
  /// **'Choose which projects this user can access.'**
  String get accessUserProjectsDesc;

  /// web: access.searchProjects
  ///
  /// In en, this message translates to:
  /// **'Search projects…'**
  String get accessSearchProjects;

  /// web: access.saveProjects
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get accessSaveProjects;

  /// web: access.saveError
  ///
  /// In en, this message translates to:
  /// **'Could not save.'**
  String get accessSaveError;

  /// web: access.selectedCount
  ///
  /// In en, this message translates to:
  /// **'{count} selected'**
  String accessSelectedCount(Object count);

  /// web: access.projectMembers
  ///
  /// In en, this message translates to:
  /// **'Project members'**
  String get accessProjectMembers;

  /// web: access.projectMembersCount
  ///
  /// In en, this message translates to:
  /// **'{count} members'**
  String accessProjectMembersCount(Object count);

  /// web: access.manageMembers
  ///
  /// In en, this message translates to:
  /// **'Manage'**
  String get accessManageMembers;

  /// web: access.membersDialogTitle
  ///
  /// In en, this message translates to:
  /// **'Project members'**
  String get accessMembersDialogTitle;

  /// web: access.membersDialogDesc
  ///
  /// In en, this message translates to:
  /// **'Only assigned members can see and work in this project.'**
  String get accessMembersDialogDesc;

  /// web: access.addMemberTitle
  ///
  /// In en, this message translates to:
  /// **'Add member'**
  String get accessAddMemberTitle;

  /// web: access.searchUsers
  ///
  /// In en, this message translates to:
  /// **'Search by name or email…'**
  String get accessSearchUsers;

  /// web: access.noMembers
  ///
  /// In en, this message translates to:
  /// **'No members yet.'**
  String get accessNoMembers;

  /// web: access.noCandidates
  ///
  /// In en, this message translates to:
  /// **'No matching users.'**
  String get accessNoCandidates;

  /// web: access.removeMember
  ///
  /// In en, this message translates to:
  /// **'Remove from project'**
  String get accessRemoveMember;

  /// web: access.memberError
  ///
  /// In en, this message translates to:
  /// **'Action failed.'**
  String get accessMemberError;

  /// web: access.assigneeNone
  ///
  /// In en, this message translates to:
  /// **'— Unassigned —'**
  String get accessAssigneeNone;

  /// web: access.colUser
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get accessColUser;

  /// web: access.colRole
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get accessColRole;

  /// web: access.colStatus
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get accessColStatus;

  /// web: access.colAccess
  ///
  /// In en, this message translates to:
  /// **'Access'**
  String get accessColAccess;

  /// web: access.colCreated
  ///
  /// In en, this message translates to:
  /// **'Created'**
  String get accessColCreated;

  /// web: access.colActions
  ///
  /// In en, this message translates to:
  /// **'Actions'**
  String get accessColActions;

  /// web: access.statusActive
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get accessStatusActive;

  /// web: access.moreActions
  ///
  /// In en, this message translates to:
  /// **'More actions'**
  String get accessMoreActions;

  /// web: dashboard.title
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboardTitle;

  /// web: dashboard.subtitle
  ///
  /// In en, this message translates to:
  /// **'An overview of your projects and tasks.'**
  String get dashboardSubtitle;

  /// web: dashboard.statTotalProjects
  ///
  /// In en, this message translates to:
  /// **'Total projects'**
  String get dashboardStatTotalProjects;

  /// web: dashboard.statTotalTasks
  ///
  /// In en, this message translates to:
  /// **'Total tasks'**
  String get dashboardStatTotalTasks;

  /// web: dashboard.statInProgress
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get dashboardStatInProgress;

  /// web: dashboard.statCompleted
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get dashboardStatCompleted;

  /// web: dashboard.statCompletionPct
  ///
  /// In en, this message translates to:
  /// **'{value}% completion rate'**
  String dashboardStatCompletionPct(Object value);

  /// web: dashboard.sectionOverdue
  ///
  /// In en, this message translates to:
  /// **'Overdue'**
  String get dashboardSectionOverdue;

  /// web: dashboard.sectionUpcoming
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get dashboardSectionUpcoming;

  /// web: dashboard.upcomingWindow
  ///
  /// In en, this message translates to:
  /// **'Next {days} days'**
  String dashboardUpcomingWindow(Object days);

  /// web: dashboard.sectionRecent
  ///
  /// In en, this message translates to:
  /// **'Recent activity'**
  String get dashboardSectionRecent;

  /// web: dashboard.sectionActiveProjects
  ///
  /// In en, this message translates to:
  /// **'Active projects'**
  String get dashboardSectionActiveProjects;

  /// web: dashboard.viewAll
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get dashboardViewAll;

  /// web: dashboard.emptyOverdue
  ///
  /// In en, this message translates to:
  /// **'No overdue tasks. Great job!'**
  String get dashboardEmptyOverdue;

  /// web: dashboard.emptyUpcoming
  ///
  /// In en, this message translates to:
  /// **'No tasks due in the coming week.'**
  String get dashboardEmptyUpcoming;

  /// web: dashboard.emptyRecent
  ///
  /// In en, this message translates to:
  /// **'No recent activity yet.'**
  String get dashboardEmptyRecent;

  /// web: dashboard.emptyProjects
  ///
  /// In en, this message translates to:
  /// **'No projects yet.'**
  String get dashboardEmptyProjects;

  /// web: dashboard.emptyProjectsCta
  ///
  /// In en, this message translates to:
  /// **'Create your first project'**
  String get dashboardEmptyProjectsCta;

  /// web: dashboard.dueToday
  ///
  /// In en, this message translates to:
  /// **'Due today'**
  String get dashboardDueToday;

  /// web: dashboard.dueTomorrow
  ///
  /// In en, this message translates to:
  /// **'Due tomorrow'**
  String get dashboardDueTomorrow;

  /// web: dashboard.dueInDays
  ///
  /// In en, this message translates to:
  /// **'Due in {days} days'**
  String dashboardDueInDays(Object days);

  /// web: dashboard.overdueByDays
  ///
  /// In en, this message translates to:
  /// **'{days} days overdue'**
  String dashboardOverdueByDays(Object days);

  /// web: dashboard.loading
  ///
  /// In en, this message translates to:
  /// **'Loading data…'**
  String get dashboardLoading;

  /// web: dashboard.error
  ///
  /// In en, this message translates to:
  /// **'Error: {message}'**
  String dashboardError(Object message);

  /// web: dashboard.sectionStatusDistribution
  ///
  /// In en, this message translates to:
  /// **'Status distribution'**
  String get dashboardSectionStatusDistribution;

  /// web: dashboard.sectionTopProjects
  ///
  /// In en, this message translates to:
  /// **'Top projects by tasks'**
  String get dashboardSectionTopProjects;

  /// web: dashboard.sectionPriorityBreakdown
  ///
  /// In en, this message translates to:
  /// **'Priority breakdown'**
  String get dashboardSectionPriorityBreakdown;

  /// web: dashboard.chartTasksLabel
  ///
  /// In en, this message translates to:
  /// **'Tasks'**
  String get dashboardChartTasksLabel;

  /// web: dashboard.chartNoData
  ///
  /// In en, this message translates to:
  /// **'Not enough data to render this chart.'**
  String get dashboardChartNoData;

  /// web: dashboard.chartTotalLabel
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get dashboardChartTotalLabel;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ja', 'vi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ja':
      return AppLocalizationsJa();
    case 'vi':
      return AppLocalizationsVi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
