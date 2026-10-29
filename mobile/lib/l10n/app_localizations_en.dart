// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get commonSave => 'Save';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonSaving => 'Saving…';

  @override
  String get commonSending => 'Sending…';

  @override
  String get commonDeleting => 'Deleting…';

  @override
  String get commonLoading => 'Loading data…';

  @override
  String get commonError => 'Error';

  @override
  String get commonBack => 'Back';

  @override
  String get commonSearch => 'Search';

  @override
  String get commonOptional => '(optional)';

  @override
  String get commonClose => 'Close';

  @override
  String get commonRetry => 'Retry';

  @override
  String get navAppName => 'Task Management';

  @override
  String get navSectionOverview => 'Overview';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navAnalytics => 'Analytics';

  @override
  String get navOrganization => 'Organization';

  @override
  String get navProjects => 'Projects';

  @override
  String get navSectionFinance => 'Finance';

  @override
  String get navTransactions => 'Transactions';

  @override
  String get navInvoices => 'Invoices';

  @override
  String get navPayments => 'Payments';

  @override
  String get navSectionTeam => 'Team';

  @override
  String get navCreateTeam => 'Create team';

  @override
  String get navTeamList => 'Team';

  @override
  String get navMembers => 'Members';

  @override
  String get navPermissions => 'Permissions';

  @override
  String get navChat => 'Chat';

  @override
  String get navMeetings => 'Meetings';

  @override
  String get navSettings => 'Settings';

  @override
  String get navHelp => 'Help';

  @override
  String get topnavOpenSidebar => 'Open sidebar';

  @override
  String get topnavCloseSidebar => 'Close sidebar';

  @override
  String get topnavBreadcrumb => 'Breadcrumb';

  @override
  String get topnavOpenUserMenu => 'Open user menu';

  @override
  String get topnavSignIn => 'Sign in';

  @override
  String get topnavThemeLight => 'Light';

  @override
  String get topnavThemeDark => 'Dark';

  @override
  String get topnavThemeSystem => 'System';

  @override
  String get topnavLanguage => 'Language';

  @override
  String get authLoginTitle => 'Sign in';

  @override
  String get authLoginSubtitle => 'Welcome back to Task Management';

  @override
  String get authLoginEmailLabel => 'Email';

  @override
  String get authLoginEmailPlaceholder => 'you@taskmanagement.app';

  @override
  String get authLoginPasswordLabel => 'Password';

  @override
  String get authLoginPasswordPlaceholder => '••••••••';

  @override
  String get authLoginForgotPassword => 'Forgot password?';

  @override
  String get authLoginShowPassword => 'Show password';

  @override
  String get authLoginHidePassword => 'Hide password';

  @override
  String get authLoginSubmit => 'Sign in';

  @override
  String get authLoginSubmitting => 'Signing in…';

  @override
  String get authLoginNoAccount => 'No account yet?';

  @override
  String get authLoginRegister => 'Register';

  @override
  String get authLoginFirebaseNotConfigured =>
      'Firebase is not configured. Create .env.local from .env.local.example.';

  @override
  String get authLoginForgotEmailPrompt =>
      'Enter your email above then click \"Forgot password\" to get a reset link.';

  @override
  String get authLoginResetEmailSent => 'Reset email sent. Check your inbox.';

  @override
  String get authRegisterTitle => 'Create account';

  @override
  String get authRegisterSubtitle => 'Start managing your projects and tasks';

  @override
  String get authRegisterFullNameLabel => 'Full name';

  @override
  String get authRegisterFullNamePlaceholder => 'e.g. John Doe';

  @override
  String get authRegisterEmailLabel => 'Email';

  @override
  String get authRegisterEmailPlaceholder => 'you@taskmanagement.app';

  @override
  String get authRegisterPasswordLabel => 'Password';

  @override
  String get authRegisterPasswordPlaceholder => 'At least 6 characters';

  @override
  String get authRegisterConfirmLabel => 'Confirm password';

  @override
  String get authRegisterConfirmPlaceholder => 'Re-enter password';

  @override
  String get authRegisterSubmit => 'Sign up';

  @override
  String get authRegisterSubmitting => 'Creating account…';

  @override
  String get authRegisterDisclaimer =>
      'By creating an account, you agree to Task Management\'s Terms and Policy.';

  @override
  String get authRegisterHaveAccount => 'Already have an account?';

  @override
  String get authRegisterLogin => 'Sign in';

  @override
  String get authRegisterErrorsFullNameRequired =>
      'Please enter your full name.';

  @override
  String get authRegisterErrorsEmailRequired => 'Please enter your email.';

  @override
  String get authRegisterErrorsPasswordMinLength =>
      'Password must be at least 6 characters.';

  @override
  String get authRegisterErrorsConfirmMismatch =>
      'Password confirmation does not match.';

  @override
  String get authRegisterErrorsFirebaseNotConfigured =>
      'Firebase is not configured. Create .env.local from .env.local.example.';

  @override
  String get authVerifyTitle => 'Verify email';

  @override
  String get authVerifySubtitle => 'We sent a verification link to';

  @override
  String get authVerifyInstruction =>
      'Open the email, click the verification link, then come back here and press \'I\'ve verified\'. Don\'t forget to check Spam.';

  @override
  String get authVerifyChecking => 'Checking…';

  @override
  String get authVerifyIVerified => 'I\'ve verified';

  @override
  String authVerifyResendCountdown(Object seconds) {
    return 'Resend in ${seconds}s';
  }

  @override
  String get authVerifyResend => 'Resend verification email';

  @override
  String get authVerifySignOutAndSwitch => 'Sign out and use another account';

  @override
  String get authVerifySuccess => 'Verified! Redirecting…';

  @override
  String get authVerifyStillNotVerified =>
      'Email is still not verified. Make sure you clicked the link. If you opened it on another device, sign out and back in to refresh.';

  @override
  String get authVerifyResent =>
      'Verification email re-sent. Check your inbox (and Spam).';

  @override
  String get profileStatusActive => 'Active';

  @override
  String get profileStatusAway => 'Away';

  @override
  String get profileStatusOffline => 'Offline';

  @override
  String get profileSectionAccount => 'Account';

  @override
  String get profileProfile => 'Profile';

  @override
  String get profileSettings => 'Settings';

  @override
  String get profileNotifications => 'Notifications';

  @override
  String get profileSectionSupport => 'Support';

  @override
  String get profileHelp => 'Help';

  @override
  String get profileTerms => 'Terms & Policy';

  @override
  String get profileChangeAvatar => 'Change avatar';

  @override
  String get profileSignOut => 'Sign out';

  @override
  String get profileSigningOut => 'Signing out…';

  @override
  String get profileUploadFailed => 'Upload failed.';

  @override
  String get projectsGuestBannerTitle => 'You are viewing in guest mode';

  @override
  String get projectsGuestBannerDesc =>
      'Sign in to see task details for each project, create new projects, and manage your work.';

  @override
  String get projectsTitle => 'Projects';

  @override
  String projectsCountLabel(Object count) {
    return '$count projects';
  }

  @override
  String get projectsCreateNew => 'New project';

  @override
  String get projectsSignInToViewTitle => 'Sign in to see your projects';

  @override
  String get projectsSignInToViewHelp =>
      'Create an account or sign in using the banner above.';

  @override
  String get projectsLoading => 'Loading data…';

  @override
  String projectsError(Object message) {
    return 'Error: $message';
  }

  @override
  String get projectsEmptyTitle => 'No projects yet';

  @override
  String get projectsEmptyHelp =>
      'Create your first project to start managing work.';

  @override
  String projectsCardTasksTotal(Object count) {
    return '$count tasks';
  }

  @override
  String projectsCardPendingShort(Object count) {
    return '$count pending';
  }

  @override
  String projectsCardInProgressShort(Object count) {
    return '$count in progress';
  }

  @override
  String projectsCardDoneShort(Object count) {
    return '$count done';
  }

  @override
  String get projectsCardProgress => 'Progress';

  @override
  String get projectsCardViewDetail => 'View details';

  @override
  String get projectDialogCreateTitle => 'New project';

  @override
  String get projectDialogCreateDesc =>
      'Enter project info to start managing tasks.';

  @override
  String get projectDialogNameLabel => 'Project name';

  @override
  String get projectDialogNamePlaceholder => 'e.g. E-commerce website';

  @override
  String get projectDialogNameRequired => 'Project name is required.';

  @override
  String get projectDialogDescriptionLabel => 'Description';

  @override
  String get projectDialogDescriptionPlaceholder =>
      'Goals, scope, overall deadline…';

  @override
  String get projectDialogThumbnailLabel => 'Thumbnail (optional)';

  @override
  String get projectDialogSubmit => 'Create project';

  @override
  String get teamDialogCreateTitle => 'Create team';

  @override
  String get teamDialogCreateDesc =>
      'Create a team to collaborate and share projects with members.';

  @override
  String get teamDialogNameLabel => 'Team name';

  @override
  String get teamDialogNamePlaceholder => 'e.g. Marketing Team';

  @override
  String get teamDialogNameRequired => 'Team name is required.';

  @override
  String get teamDialogDescriptionLabel => 'Description';

  @override
  String get teamDialogDescriptionPlaceholder => 'What is this team about?';

  @override
  String get teamDialogAvatarLabel => 'Team avatar (optional)';

  @override
  String get teamDialogVisibilityLabel => 'Visibility';

  @override
  String get teamDialogVisibilityPrivate => 'Private';

  @override
  String get teamDialogVisibilityPrivateHint =>
      'Only invited members can see and join.';

  @override
  String get teamDialogVisibilityPublic => 'Public';

  @override
  String get teamDialogVisibilityPublicHint =>
      'Anyone in the workspace can find this team.';

  @override
  String get teamDialogInviteLabel => 'Invite members (optional)';

  @override
  String get teamDialogInvitePlaceholder => 'Enter an email and press Enter';

  @override
  String get teamDialogInviteHint =>
      'Invitations are sent by email. You can also invite later.';

  @override
  String get teamDialogInviteInvalid => 'Invalid email address.';

  @override
  String get teamDialogSubmit => 'Create team';

  @override
  String get teamDialogCreating => 'Creating…';

  @override
  String get teamDialogCreateError =>
      'Failed to create team. Please try again.';

  @override
  String get teamsListTitle => 'Teams';

  @override
  String teamsListCountLabel(Object count) {
    return '$count teams';
  }

  @override
  String get teamsListLoading => 'Loading teams…';

  @override
  String teamsListError(Object message) {
    return 'Failed to load: $message';
  }

  @override
  String get teamsListEmptyTitle => 'No teams yet';

  @override
  String get teamsListEmptyHelp =>
      'Create a team using the + button in the sidebar to get started.';

  @override
  String get teamsListLoadMore => 'Load more';

  @override
  String get teamsListLoadingMore => 'Loading…';

  @override
  String get teamsListEndOfList => 'You\'ve reached the end.';

  @override
  String teamsListCardMembersCount(Object count) {
    return '$count members';
  }

  @override
  String get teamsListCardVisibilityPrivate => 'Private';

  @override
  String get teamsListCardVisibilityPublic => 'Public';

  @override
  String get teamsListCardRoleOwner => 'Owner';

  @override
  String get teamsListCardRoleAdmin => 'Admin';

  @override
  String get teamsListCardRoleMember => 'Member';

  @override
  String get teamsListDeleteAria => 'Delete team';

  @override
  String get teamsListDeleteTitle => 'Delete team';

  @override
  String teamsListDeleteMessage(Object name) {
    return 'Are you sure you want to delete the team \"$name\"? This action cannot be undone.';
  }

  @override
  String get teamsListDeleteConfirmWord => 'DELETE';

  @override
  String teamsListDeleteConfirmPrompt(Object word) {
    return 'Type $word to confirm deletion.';
  }

  @override
  String teamsListDeletePlaceholder(Object word) {
    return 'Type $word';
  }

  @override
  String get teamsListDeleteSubmit => 'Delete team';

  @override
  String get teamsListDeleting => 'Deleting…';

  @override
  String get teamsListDeleteError => 'Failed to delete team. Please try again.';

  @override
  String get membersListTitle => 'Members';

  @override
  String get membersListSubtitle => 'All users in the system';

  @override
  String membersListCountLabel(Object count) {
    return '$count users';
  }

  @override
  String get membersListSearchPlaceholder => 'Search by name or email…';

  @override
  String get membersListLoading => 'Loading members…';

  @override
  String membersListError(Object message) {
    return 'Failed to load: $message';
  }

  @override
  String get membersListEmptyTitle => 'No users yet';

  @override
  String get membersListEmptyHelp => 'There is no user data.';

  @override
  String get membersListEmptyHelpSearch => 'No users match your search.';

  @override
  String get membersListLoadMore => 'Load more';

  @override
  String get membersListLoadingMore => 'Loading…';

  @override
  String get membersListEndOfList => 'End of list.';

  @override
  String get membersListRoleAdmin => 'Admin';

  @override
  String get membersListRoleUser => 'Customer';

  @override
  String membersListTeamCountLabel(Object count) {
    return '$count teams';
  }

  @override
  String get membersListVerified => 'Verified';

  @override
  String get membersListUnverified => 'Unverified';

  @override
  String get membersListYou => 'You';

  @override
  String get membersListActionEdit => 'Edit';

  @override
  String get membersListActionManageTeams => 'Manage teams';

  @override
  String get membersListEditTitle => 'Edit user';

  @override
  String get membersListEditDesc => 'Update display name and system role.';

  @override
  String get membersListEditNameLabel => 'Display name';

  @override
  String get membersListEditNamePlaceholder => 'Enter display name';

  @override
  String get membersListEditRoleLabel => 'System role';

  @override
  String get membersListEditRoleAdmin => 'Admin';

  @override
  String get membersListEditRoleUser => 'Customer';

  @override
  String get membersListEditSubmit => 'Save changes';

  @override
  String get membersListEditError => 'Update failed. Please try again.';

  @override
  String membersListTeamsTitle(Object name) {
    return '$name\'s teams';
  }

  @override
  String get membersListTeamsDesc => 'Add or remove the user from teams.';

  @override
  String get membersListTeamsLoading => 'Loading teams…';

  @override
  String get membersListTeamsEmpty => 'This user is not in any team.';

  @override
  String get membersListTeamsOwnerBadge => 'Owner';

  @override
  String get membersListTeamsRoleAdmin => 'Admin';

  @override
  String get membersListTeamsRoleMember => 'Member';

  @override
  String get membersListTeamsRemove => 'Remove from team';

  @override
  String get membersListTeamsRemoveError =>
      'Failed to remove from team. Please try again.';

  @override
  String get membersListTeamsRemoving => 'Removing…';

  @override
  String get membersListTeamsAddTitle => 'Add to team';

  @override
  String get membersListTeamsSelectTeamLabel => 'Select team';

  @override
  String get membersListTeamsSelectTeamPlaceholder => '— Select a team —';

  @override
  String get membersListTeamsSearchPlaceholder => 'Search teams…';

  @override
  String get membersListTeamsNoTeams => 'No matching teams.';

  @override
  String get membersListTeamsAddRoleLabel => 'Role in team';

  @override
  String get membersListTeamsAddRoleMember => 'Member';

  @override
  String get membersListTeamsAddRoleAdmin => 'Admin';

  @override
  String get membersListTeamsAddSubmit => 'Add to team';

  @override
  String get membersListTeamsAdding => 'Adding…';

  @override
  String get membersListTeamsAddError =>
      'Failed to add to team. Please try again.';

  @override
  String get teamDetailLoading => 'Loading team…';

  @override
  String teamDetailError(Object message) {
    return 'Failed to load: $message';
  }

  @override
  String get teamDetailNotFound => 'Team not found.';

  @override
  String get teamDetailVisibilityPrivate => 'Private';

  @override
  String get teamDetailVisibilityPublic => 'Public';

  @override
  String get teamDetailMembersTitle => 'Members';

  @override
  String teamDetailMembersCount(Object count) {
    return '$count members';
  }

  @override
  String get teamDetailRoleOwner => 'Owner';

  @override
  String get teamDetailRoleAdmin => 'Admin';

  @override
  String get teamDetailRoleMember => 'Member';

  @override
  String get teamDetailYou => 'You';

  @override
  String get teamDetailMakeAdmin => 'Make admin';

  @override
  String get teamDetailMakeMember => 'Set as member';

  @override
  String get teamDetailRemoveMember => 'Remove';

  @override
  String get teamDetailRemoveConfirm => 'Remove this member from the team?';

  @override
  String get teamDetailLeaveTeam => 'Leave team';

  @override
  String get teamDetailLeaveConfirm =>
      'Are you sure you want to leave this team?';

  @override
  String get teamDetailInviteTitle => 'Add / invite members';

  @override
  String get teamDetailInvitePlaceholder => 'Enter an email and press Enter';

  @override
  String get teamDetailInviteHint =>
      'Invitations are sent by email. Added emails appear as pending below.';

  @override
  String get teamDetailInviteSubmit => 'Send invites';

  @override
  String get teamDetailInviteSending => 'Sending…';

  @override
  String get teamDetailInviteInvalid => 'Invalid email address.';

  @override
  String get teamDetailInviteError =>
      'Failed to send invites. Please try again.';

  @override
  String get teamDetailPendingTitle => 'Pending invites';

  @override
  String get teamDetailPendingEmpty => 'No pending invites.';

  @override
  String get teamDetailStatusPending => 'Pending';

  @override
  String get teamDetailCancelInvite => 'Cancel';

  @override
  String get teamDetailProjectsTitle => 'Projects';

  @override
  String get teamDetailProjectsEmpty =>
      'No projects assigned to this team yet.';

  @override
  String get teamDetailAddProject => 'Add project';

  @override
  String get teamDetailRemoveProject => 'Remove';

  @override
  String get teamDetailRemoveProjectConfirm =>
      'Remove this project from the team?';

  @override
  String get teamDetailAddProjectTitle => 'Add project to team';

  @override
  String get teamDetailAddProjectDesc =>
      'Choose one of your projects to add to this team.';

  @override
  String get teamDetailAddProjectEmpty =>
      'You have no projects available to add.';

  @override
  String get teamDetailAddProjectSubmit => 'Add';

  @override
  String get teamDetailAddingProject => 'Adding…';

  @override
  String get teamDetailAddProjectError =>
      'Failed to add project. Please try again.';

  @override
  String get invitePageTitle => 'Team invitation';

  @override
  String get invitePageDescription =>
      'You\'ve been invited to join a team. Accept to become a member.';

  @override
  String get invitePageMissingToken => 'Invalid or missing invitation link.';

  @override
  String get invitePageSignInRequired =>
      'Please sign in to accept this invitation.';

  @override
  String get invitePageSignInButton => 'Sign in';

  @override
  String get invitePageAccept => 'Accept invitation';

  @override
  String get invitePageAccepting => 'Accepting…';

  @override
  String get invitePageSuccessTitle => 'You\'ve joined the team!';

  @override
  String get invitePageSuccessDesc => 'You are now a member of this team.';

  @override
  String get invitePageGoToTeam => 'Go to team';

  @override
  String get invitePageErrorTitle => 'Could not accept invitation';

  @override
  String get invitePageBackToTeams => 'Back to teams';

  @override
  String get tasksTitle => 'Task Manager';

  @override
  String get tasksCreateNew => 'New task';

  @override
  String get tasksCreateShort => 'New task';

  @override
  String get tasksFilterAll => 'All';

  @override
  String get tasksSearchPlaceholder => 'Search tasks by name, tag, assignee…';

  @override
  String get tasksLoading => 'Loading data…';

  @override
  String tasksErrorPrefix(Object message) {
    return 'Error: $message';
  }

  @override
  String get tasksEmptyTitle => 'No tasks';

  @override
  String get tasksEmptyHelp =>
      'Create your first task to start managing your work.';

  @override
  String get tasksEmptyHelpSearch =>
      'Try a different keyword or clear filters.';

  @override
  String get tasksStatusPending => 'Pending';

  @override
  String get tasksStatusInProgress => 'In progress';

  @override
  String get tasksStatusCompleted => 'Completed';

  @override
  String tasksPriorityLabel(Object value) {
    return 'Priority: $value';
  }

  @override
  String get tasksPriorityLow => 'Low';

  @override
  String get tasksPriorityMedium => 'Medium';

  @override
  String get tasksPriorityHigh => 'High';

  @override
  String get taskDialogCreateTitle => 'New task';

  @override
  String get taskDialogEditTitle => 'Edit task';

  @override
  String get taskDialogDescription => 'Enter the task details.';

  @override
  String get taskDialogNoLabel => 'Number';

  @override
  String get taskDialogNoPlaceholder => 'e.g. 6';

  @override
  String get taskDialogNoRequired => 'Number is required.';

  @override
  String get taskDialogNoInvalid => 'Number must be a positive integer.';

  @override
  String get taskDialogNoMustGtZero => 'Number must be greater than 0.';

  @override
  String taskDialogNoDuplicate(Object value) {
    return 'Number #$value already exists in this project.';
  }

  @override
  String taskDialogNoHint(Object value) {
    return 'Suggested: #$value';
  }

  @override
  String get taskDialogTitleLabel => 'Title';

  @override
  String get taskDialogTitlePlaceholder => 'e.g. Finish weekly report';

  @override
  String get taskDialogTitleRequired => 'Title is required.';

  @override
  String get taskDialogDescriptionLabel => 'Description';

  @override
  String get taskDialogDescriptionPlaceholder => 'Work details, notes…';

  @override
  String get taskDialogStatusLabel => 'Status';

  @override
  String get taskDialogPriorityLabel => 'Priority';

  @override
  String get taskDialogStartDateLabel => 'Start date';

  @override
  String get taskDialogDueDateLabel => 'Due date';

  @override
  String get taskDialogAssigneeLabel => 'Assignee';

  @override
  String get taskDialogAssigneePlaceholder => 'e.g. John';

  @override
  String get taskDialogTagsLabel => 'Tags (comma separated)';

  @override
  String get taskDialogTagsPlaceholder => 'backend, urgent';

  @override
  String get taskDialogThumbnailLabel => 'Thumbnail (optional)';

  @override
  String get taskDialogSubmitCreate => 'Create task';

  @override
  String get taskDialogSubmitEdit => 'Save changes';

  @override
  String taskItemAriaNumber(Object value) {
    return 'Task number $value';
  }

  @override
  String taskItemAriaComments(Object count) {
    return '$count comments';
  }

  @override
  String get taskItemAriaEdit => 'Edit task';

  @override
  String get taskItemAriaDelete => 'Delete task';

  @override
  String get taskDetailBack => 'Back';

  @override
  String get taskDetailEdit => 'Edit';

  @override
  String get taskDetailDelete => 'Delete';

  @override
  String get taskDetailAssignee => 'Assignee:';

  @override
  String get taskDetailStartDate => 'Start:';

  @override
  String get taskDetailDueDate => 'Due:';

  @override
  String get taskDetailOverdue => 'Overdue';

  @override
  String get taskDetailTags => 'Tags:';

  @override
  String get taskDetailDescriptionHeading => 'Description';

  @override
  String get taskDetailNoDescription => 'No description yet.';

  @override
  String taskDetailPriorityWithLabel(Object value) {
    return 'Priority: $value';
  }

  @override
  String get taskDetailDeleteConfirm => 'Delete this task?';

  @override
  String get commentsTitle => 'Comments';

  @override
  String get commentsYourComment => 'Your comment';

  @override
  String get commentsPlaceholder => 'Write a comment…';

  @override
  String get commentsAttach => 'Attach';

  @override
  String get commentsAttachOnlyFallback => '(attachment)';

  @override
  String get commentsUserFallback => 'User';

  @override
  String commentsRemoveFile(Object name) {
    return 'Remove file $name';
  }

  @override
  String commentsMaxPerComment(Object count) {
    return 'Maximum $count files per comment.';
  }

  @override
  String get commentsLoading => 'Loading comments…';

  @override
  String get commentsEmpty => 'No comments yet. Be the first!';

  @override
  String get commentsReply => 'Reply';

  @override
  String get commentsEdit => 'Edit';

  @override
  String get commentsDelete => 'Delete';

  @override
  String get commentsDeleteConfirm => 'Delete this comment?';

  @override
  String get commentsSend => 'Send comment';

  @override
  String get commentsSending => 'Sending…';

  @override
  String get commentsSendReply => 'Send reply';

  @override
  String commentsReplyingTo(Object name) {
    return 'Replying to @$name';
  }

  @override
  String commentsReplyPlaceholder(Object name) {
    return 'Reply to @$name…';
  }

  @override
  String get commentsCancel => 'Cancel';

  @override
  String get commentsSave => 'Save';

  @override
  String get commentsEdited => ' (edited)';

  @override
  String get commentsOpenPdfTitle => 'Open PDF in new tab';

  @override
  String commentsDownloadTitle(Object name, Object size) {
    return 'Download: $name ($size)';
  }

  @override
  String attachmentsErrorEmpty(Object name) {
    return 'File \"$name\" is empty.';
  }

  @override
  String attachmentsErrorTooLarge(Object name, Object limit) {
    return 'File \"$name\" exceeds the ${limit}MB limit.';
  }

  @override
  String attachmentsErrorBlocked(Object ext) {
    return 'Extension .$ext is not allowed.';
  }

  @override
  String attachmentsErrorUnsupported(Object ext) {
    return 'Extension .$ext is not supported.';
  }

  @override
  String attachmentsErrorBadMime(Object mime, Object name) {
    return 'MIME \"$mime\" of file \"$name\" is not supported.';
  }

  @override
  String get fileInputPickImage => 'Pick image';

  @override
  String get fileInputChangeImage => 'Change image';

  @override
  String get fileInputClear => 'Clear';

  @override
  String get fileInputHelper => 'JPG/PNG/WEBP/GIF, max 5MB';

  @override
  String get fileInputErrorInvalidType => 'Only JPG/PNG/WEBP/GIF supported.';

  @override
  String get fileInputErrorTooLarge => 'File too large (max 5MB).';

  @override
  String get imageLightboxClose => 'Close';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsSubtitle =>
      'Manage your appearance and language preferences.';

  @override
  String get settingsSectionAppearance => 'Appearance';

  @override
  String get settingsTheme => 'Theme';

  @override
  String get settingsThemeLight => 'Light';

  @override
  String get settingsThemeDark => 'Dark';

  @override
  String get settingsThemeSystem => 'System';

  @override
  String get settingsSectionLanguage => 'Language';

  @override
  String get settingsLanguage => 'Display language';

  @override
  String get settingsLanguageHelp =>
      'Choose the language used across the interface.';

  @override
  String get languagesEn => 'English';

  @override
  String get languagesVi => 'Tiếng Việt';

  @override
  String get languagesJa => '日本語';

  @override
  String get breadcrumbsDashboard => 'Dashboard';

  @override
  String get breadcrumbsProjectFallback => 'Project';

  @override
  String get breadcrumbsTaskFallback => 'Task';

  @override
  String get breadcrumbsTask => 'Task';

  @override
  String get breadcrumbsSettings => 'Settings';

  @override
  String get pagesTaskLoading => 'Loading task…';

  @override
  String get pagesTaskErrorFallback => 'Could not load task.';

  @override
  String get taskImagesLabel => 'Images';

  @override
  String get taskImagesHint => 'Drag to reorder · The first image is the cover';

  @override
  String get taskImagesCover => 'Cover';

  @override
  String get taskImagesSetCover => 'Set as cover';

  @override
  String get taskImagesRemove => 'Remove image';

  @override
  String get taskImagesAdd => 'Add images';

  @override
  String get taskImagesAddHint => 'Drop or click';

  @override
  String taskImagesLimitReached(Object count) {
    return 'Limit of $count images reached';
  }

  @override
  String taskImagesTooLarge(Object name) {
    return '$name: larger than 5MB';
  }

  @override
  String taskImagesBadType(Object name) {
    return '$name: unsupported format (JPG/PNG/WEBP/GIF)';
  }

  @override
  String taskImagesTooMany(Object count) {
    return 'You can add at most $count more images';
  }

  @override
  String taskImagesUploading(Object done, Object total) {
    return 'Uploading images $done/$total…';
  }

  @override
  String taskImagesUploadFailed(Object count) {
    return '$count images failed to upload. The task was saved — you can add them again later.';
  }

  @override
  String get taskImagesClose => 'Close';

  @override
  String get taskImagesPrev => 'Previous image';

  @override
  String get taskImagesNext => 'Next image';

  @override
  String get taskImagesOpenFull => 'View full screen';

  @override
  String taskImagesImageCount(Object count) {
    return '$count images';
  }

  @override
  String get mobileNotificationsSubtitle =>
      'Updates about tasks in your projects.';

  @override
  String get mobileNotificationsAssigned => 'Assigned to you';

  @override
  String get mobileNotificationsEmpty => 'No new notifications.';

  @override
  String get mobileConfigMissingTitle => 'Firebase configuration missing';

  @override
  String get mobileConfigMissingDesc =>
      'Run the app with --dart-define-from-file=config/firebase.json (see mobile/README.md).';

  @override
  String get mobileOpenFile => 'Open file';

  @override
  String get mobilePickFromGallery => 'Choose from library';

  @override
  String get mobileTakePhoto => 'Take photo';

  @override
  String get mobilePickFiles => 'Choose files';

  @override
  String get mobileProfileTitle => 'Account';

  @override
  String get accessRoleAdmin => 'Administrator';

  @override
  String get accessRoleCustomer => 'Customer';

  @override
  String get accessNoPermissionTitle => 'You don\'t have access to this page';

  @override
  String get accessNoPermissionDesc =>
      'This page is for administrators only. If you need access, please contact your administrator.';

  @override
  String get accessBackToDashboard => 'Back to Dashboard';

  @override
  String get accessDeniedLogin =>
      'Your account has not been granted access or has been locked.';

  @override
  String get accessContactAdmin =>
      'Please contact your administrator for help.';

  @override
  String get accessCreateAccount => 'Create account';

  @override
  String get accessCreateTitle => 'Create a new account';

  @override
  String get accessCreateDesc =>
      'The user will receive an email with a link to set their password.';

  @override
  String get accessEmailLabel => 'Email';

  @override
  String get accessEmailPlaceholder => 'customer@company.com';

  @override
  String get accessNameLabel => 'Display name';

  @override
  String get accessNamePlaceholder => 'e.g. John Smith';

  @override
  String get accessRoleLabel => 'Role';

  @override
  String get accessRoleCustomerHint => 'Sees assigned projects only';

  @override
  String get accessRoleAdminHint => 'Full system access';

  @override
  String get accessProjectsLabel => 'Project access';

  @override
  String get accessProjectsHint =>
      'Customers can only see the projects selected here.';

  @override
  String get accessNoProjectsAvailable => 'No projects yet.';

  @override
  String get accessCreating => 'Creating…';

  @override
  String get accessCreateSubmit => 'Create account';

  @override
  String get accessCreateError => 'Could not create the account.';

  @override
  String get accessCreatedTitle => 'Account created';

  @override
  String accessCreatedEmailSent(Object email) {
    return 'A set-password email has been sent to $email.';
  }

  @override
  String accessCreatedEmailFailed(Object email) {
    return 'Could not send email to $email. Copy the link below and send it to the user.';
  }

  @override
  String get accessSetPasswordLink => 'Set-password link';

  @override
  String get accessCopy => 'Copy';

  @override
  String get accessCopied => 'Copied';

  @override
  String get accessDone => 'Done';

  @override
  String get accessActionProjects => 'Projects';

  @override
  String get accessActionLock => 'Lock';

  @override
  String get accessActionUnlock => 'Unlock';

  @override
  String get accessActionResendLink => 'Resend link';

  @override
  String accessLockConfirm(Object email) {
    return 'Lock account $email? The user won\'t be able to sign in until unlocked.';
  }

  @override
  String accessUnlockConfirm(Object email) {
    return 'Unlock account $email?';
  }

  @override
  String get accessStatusDisabled => 'Locked';

  @override
  String accessProjectCountLabel(Object count) {
    return '$count projects';
  }

  @override
  String get accessResendTitle => 'New set-password link';

  @override
  String get accessResendError => 'Could not create a set-password link.';

  @override
  String accessUserProjectsTitle(Object name) {
    return 'Projects of $name';
  }

  @override
  String get accessUserProjectsDesc =>
      'Choose which projects this user can access.';

  @override
  String get accessSearchProjects => 'Search projects…';

  @override
  String get accessSaveProjects => 'Save';

  @override
  String get accessSaveError => 'Could not save.';

  @override
  String accessSelectedCount(Object count) {
    return '$count selected';
  }

  @override
  String get accessProjectMembers => 'Project members';

  @override
  String accessProjectMembersCount(Object count) {
    return '$count members';
  }

  @override
  String get accessManageMembers => 'Manage';

  @override
  String get accessMembersDialogTitle => 'Project members';

  @override
  String get accessMembersDialogDesc =>
      'Only assigned members can see and work in this project.';

  @override
  String get accessAddMemberTitle => 'Add member';

  @override
  String get accessSearchUsers => 'Search by name or email…';

  @override
  String get accessNoMembers => 'No members yet.';

  @override
  String get accessNoCandidates => 'No matching users.';

  @override
  String get accessRemoveMember => 'Remove from project';

  @override
  String get accessMemberError => 'Action failed.';

  @override
  String get accessAssigneeNone => '— Unassigned —';

  @override
  String get accessColUser => 'User';

  @override
  String get accessColRole => 'Role';

  @override
  String get accessColStatus => 'Status';

  @override
  String get accessColAccess => 'Access';

  @override
  String get accessColCreated => 'Created';

  @override
  String get accessColActions => 'Actions';

  @override
  String get accessStatusActive => 'Active';

  @override
  String get accessMoreActions => 'More actions';

  @override
  String get dashboardTitle => 'Dashboard';

  @override
  String get dashboardSubtitle => 'An overview of your projects and tasks.';

  @override
  String get dashboardStatTotalProjects => 'Total projects';

  @override
  String get dashboardStatTotalTasks => 'Total tasks';

  @override
  String get dashboardStatInProgress => 'In progress';

  @override
  String get dashboardStatCompleted => 'Completed';

  @override
  String dashboardStatCompletionPct(Object value) {
    return '$value% completion rate';
  }

  @override
  String get dashboardSectionOverdue => 'Overdue';

  @override
  String get dashboardSectionUpcoming => 'Upcoming';

  @override
  String dashboardUpcomingWindow(Object days) {
    return 'Next $days days';
  }

  @override
  String get dashboardSectionRecent => 'Recent activity';

  @override
  String get dashboardSectionActiveProjects => 'Active projects';

  @override
  String get dashboardViewAll => 'View all';

  @override
  String get dashboardEmptyOverdue => 'No overdue tasks. Great job!';

  @override
  String get dashboardEmptyUpcoming => 'No tasks due in the coming week.';

  @override
  String get dashboardEmptyRecent => 'No recent activity yet.';

  @override
  String get dashboardEmptyProjects => 'No projects yet.';

  @override
  String get dashboardEmptyProjectsCta => 'Create your first project';

  @override
  String get dashboardDueToday => 'Due today';

  @override
  String get dashboardDueTomorrow => 'Due tomorrow';

  @override
  String dashboardDueInDays(Object days) {
    return 'Due in $days days';
  }

  @override
  String dashboardOverdueByDays(Object days) {
    return '$days days overdue';
  }

  @override
  String get dashboardLoading => 'Loading data…';

  @override
  String dashboardError(Object message) {
    return 'Error: $message';
  }

  @override
  String get dashboardSectionStatusDistribution => 'Status distribution';

  @override
  String get dashboardSectionTopProjects => 'Top projects by tasks';

  @override
  String get dashboardSectionPriorityBreakdown => 'Priority breakdown';

  @override
  String get dashboardChartTasksLabel => 'Tasks';

  @override
  String get dashboardChartNoData => 'Not enough data to render this chart.';

  @override
  String get dashboardChartTotalLabel => 'Total';
}
