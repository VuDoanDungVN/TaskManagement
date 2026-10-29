// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Vietnamese (`vi`).
class AppLocalizationsVi extends AppLocalizations {
  AppLocalizationsVi([String locale = 'vi']) : super(locale);

  @override
  String get commonSave => 'Lưu';

  @override
  String get commonCancel => 'Huỷ';

  @override
  String get commonEdit => 'Sửa';

  @override
  String get commonDelete => 'Xoá';

  @override
  String get commonSaving => 'Đang lưu…';

  @override
  String get commonSending => 'Đang gửi…';

  @override
  String get commonDeleting => 'Đang xoá…';

  @override
  String get commonLoading => 'Đang tải dữ liệu…';

  @override
  String get commonError => 'Lỗi';

  @override
  String get commonBack => 'Quay lại';

  @override
  String get commonSearch => 'Tìm kiếm';

  @override
  String get commonOptional => '(tuỳ chọn)';

  @override
  String get commonClose => 'Đóng';

  @override
  String get commonRetry => 'Thử lại';

  @override
  String get navAppName => 'Task Management';

  @override
  String get navSectionOverview => 'Tổng quan';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navAnalytics => 'Thống kê';

  @override
  String get navOrganization => 'Tổ chức';

  @override
  String get navProjects => 'Dự án';

  @override
  String get navSectionFinance => 'Tài chính';

  @override
  String get navTransactions => 'Giao dịch';

  @override
  String get navInvoices => 'Hoá đơn';

  @override
  String get navPayments => 'Thanh toán';

  @override
  String get navSectionTeam => 'Đội nhóm';

  @override
  String get navCreateTeam => 'Tạo đội nhóm';

  @override
  String get navTeamList => 'Team';

  @override
  String get navMembers => 'Thành viên';

  @override
  String get navPermissions => 'Quyền hạn';

  @override
  String get navChat => 'Trò chuyện';

  @override
  String get navMeetings => 'Cuộc họp';

  @override
  String get navSettings => 'Cài đặt';

  @override
  String get navHelp => 'Trợ giúp';

  @override
  String get topnavOpenSidebar => 'Mở sidebar';

  @override
  String get topnavCloseSidebar => 'Đóng sidebar';

  @override
  String get topnavBreadcrumb => 'Breadcrumb';

  @override
  String get topnavOpenUserMenu => 'Mở menu người dùng';

  @override
  String get topnavSignIn => 'Đăng nhập';

  @override
  String get topnavThemeLight => 'Sáng';

  @override
  String get topnavThemeDark => 'Tối';

  @override
  String get topnavThemeSystem => 'Theo hệ thống';

  @override
  String get topnavLanguage => 'Ngôn ngữ';

  @override
  String get authLoginTitle => 'Đăng nhập';

  @override
  String get authLoginSubtitle => 'Chào mừng bạn quay lại Task Management';

  @override
  String get authLoginEmailLabel => 'Email';

  @override
  String get authLoginEmailPlaceholder => 'ban@taskmanagement.app';

  @override
  String get authLoginPasswordLabel => 'Mật khẩu';

  @override
  String get authLoginPasswordPlaceholder => '••••••••';

  @override
  String get authLoginForgotPassword => 'Quên mật khẩu?';

  @override
  String get authLoginShowPassword => 'Hiện mật khẩu';

  @override
  String get authLoginHidePassword => 'Ẩn mật khẩu';

  @override
  String get authLoginSubmit => 'Đăng nhập';

  @override
  String get authLoginSubmitting => 'Đang đăng nhập…';

  @override
  String get authLoginNoAccount => 'Chưa có tài khoản?';

  @override
  String get authLoginRegister => 'Đăng ký';

  @override
  String get authLoginFirebaseNotConfigured =>
      'Firebase chưa được cấu hình. Hãy tạo .env.local theo .env.local.example.';

  @override
  String get authLoginForgotEmailPrompt =>
      'Nhập email phía trên rồi bấm \"Quên mật khẩu\" để nhận link đặt lại.';

  @override
  String get authLoginResetEmailSent =>
      'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.';

  @override
  String get authRegisterTitle => 'Tạo tài khoản';

  @override
  String get authRegisterSubtitle =>
      'Bắt đầu quản lý dự án và công việc của bạn';

  @override
  String get authRegisterFullNameLabel => 'Họ và tên';

  @override
  String get authRegisterFullNamePlaceholder => 'VD: Nguyễn Văn Dung';

  @override
  String get authRegisterEmailLabel => 'Email';

  @override
  String get authRegisterEmailPlaceholder => 'ban@taskmanagement.app';

  @override
  String get authRegisterPasswordLabel => 'Mật khẩu';

  @override
  String get authRegisterPasswordPlaceholder => 'Tối thiểu 6 ký tự';

  @override
  String get authRegisterConfirmLabel => 'Xác nhận mật khẩu';

  @override
  String get authRegisterConfirmPlaceholder => 'Nhập lại mật khẩu';

  @override
  String get authRegisterSubmit => 'Đăng ký';

  @override
  String get authRegisterSubmitting => 'Đang tạo tài khoản…';

  @override
  String get authRegisterDisclaimer =>
      'Bằng việc tạo tài khoản, bạn đồng ý với Điều khoản và Chính sách của Task Management.';

  @override
  String get authRegisterHaveAccount => 'Đã có tài khoản?';

  @override
  String get authRegisterLogin => 'Đăng nhập';

  @override
  String get authRegisterErrorsFullNameRequired => 'Vui lòng nhập họ và tên.';

  @override
  String get authRegisterErrorsEmailRequired => 'Vui lòng nhập email.';

  @override
  String get authRegisterErrorsPasswordMinLength =>
      'Mật khẩu phải có ít nhất 6 ký tự.';

  @override
  String get authRegisterErrorsConfirmMismatch =>
      'Mật khẩu xác nhận không khớp.';

  @override
  String get authRegisterErrorsFirebaseNotConfigured =>
      'Firebase chưa được cấu hình. Hãy tạo .env.local theo .env.local.example.';

  @override
  String get authVerifyTitle => 'Xác thực email';

  @override
  String get authVerifySubtitle => 'Chúng tôi đã gửi link xác thực đến';

  @override
  String get authVerifyInstruction =>
      'Mở email, nhấn vào link xác thực rồi quay lại đây và bấm Tôi đã xác thực. Đừng quên kiểm tra cả thư mục Spam.';

  @override
  String get authVerifyChecking => 'Đang kiểm tra…';

  @override
  String get authVerifyIVerified => 'Tôi đã xác thực';

  @override
  String authVerifyResendCountdown(Object seconds) {
    return 'Gửi lại sau ${seconds}s';
  }

  @override
  String get authVerifyResend => 'Gửi lại email xác thực';

  @override
  String get authVerifySignOutAndSwitch => 'Đăng xuất và dùng tài khoản khác';

  @override
  String get authVerifySuccess => 'Xác thực thành công! Đang chuyển hướng…';

  @override
  String get authVerifyStillNotVerified =>
      'Email vẫn chưa được xác thực. Vui lòng đảm bảo đã nhấn link trong email rồi thử lại. Nếu link đã được mở từ thiết bị khác, hãy đăng xuất và đăng nhập lại để cập nhật.';

  @override
  String get authVerifyResent =>
      'Đã gửi lại email xác thực. Hãy kiểm tra hộp thư (kể cả Spam).';

  @override
  String get profileStatusActive => 'Đang hoạt động';

  @override
  String get profileStatusAway => 'Vắng mặt';

  @override
  String get profileStatusOffline => 'Ngoại tuyến';

  @override
  String get profileSectionAccount => 'Tài khoản';

  @override
  String get profileProfile => 'Hồ sơ cá nhân';

  @override
  String get profileSettings => 'Cài đặt';

  @override
  String get profileNotifications => 'Thông báo';

  @override
  String get profileSectionSupport => 'Hỗ trợ';

  @override
  String get profileHelp => 'Trợ giúp';

  @override
  String get profileTerms => 'Điều khoản & Chính sách';

  @override
  String get profileChangeAvatar => 'Đổi ảnh đại diện';

  @override
  String get profileSignOut => 'Đăng xuất';

  @override
  String get profileSigningOut => 'Đang đăng xuất…';

  @override
  String get profileUploadFailed => 'Upload thất bại.';

  @override
  String get projectsGuestBannerTitle => 'Bạn đang xem ở chế độ khách';

  @override
  String get projectsGuestBannerDesc =>
      'Đăng nhập để xem chi tiết task của từng dự án, tạo dự án mới và quản lý công việc.';

  @override
  String get projectsTitle => 'Dự án';

  @override
  String projectsCountLabel(Object count) {
    return '$count dự án';
  }

  @override
  String get projectsCreateNew => 'Tạo dự án mới';

  @override
  String get projectsSignInToViewTitle => 'Đăng nhập để xem dự án';

  @override
  String get projectsSignInToViewHelp =>
      'Tạo tài khoản hoặc đăng nhập bằng banner phía trên.';

  @override
  String get projectsLoading => 'Đang tải dữ liệu…';

  @override
  String projectsError(Object message) {
    return 'Lỗi: $message';
  }

  @override
  String get projectsEmptyTitle => 'Chưa có dự án nào';

  @override
  String get projectsEmptyHelp =>
      'Tạo dự án đầu tiên để bắt đầu quản lý công việc.';

  @override
  String projectsCardTasksTotal(Object count) {
    return '$count task';
  }

  @override
  String projectsCardPendingShort(Object count) {
    return '$count chưa';
  }

  @override
  String projectsCardInProgressShort(Object count) {
    return '$count đang';
  }

  @override
  String projectsCardDoneShort(Object count) {
    return '$count xong';
  }

  @override
  String get projectsCardProgress => 'Tiến độ';

  @override
  String get projectsCardViewDetail => 'Xem chi tiết';

  @override
  String get projectDialogCreateTitle => 'Tạo dự án mới';

  @override
  String get projectDialogCreateDesc =>
      'Nhập thông tin dự án để bắt đầu quản lý task.';

  @override
  String get projectDialogNameLabel => 'Tên dự án';

  @override
  String get projectDialogNamePlaceholder => 'VD: Website thương mại điện tử';

  @override
  String get projectDialogNameRequired => 'Tên dự án là bắt buộc.';

  @override
  String get projectDialogDescriptionLabel => 'Mô tả';

  @override
  String get projectDialogDescriptionPlaceholder =>
      'Mục tiêu, phạm vi, deadline tổng…';

  @override
  String get projectDialogThumbnailLabel => 'Thumbnail (tuỳ chọn)';

  @override
  String get projectDialogSubmit => 'Tạo dự án';

  @override
  String get teamDialogCreateTitle => 'Tạo đội nhóm';

  @override
  String get teamDialogCreateDesc =>
      'Tạo nhóm để cộng tác và chia sẻ dự án với các thành viên.';

  @override
  String get teamDialogNameLabel => 'Tên nhóm';

  @override
  String get teamDialogNamePlaceholder => 'VD: Nhóm Marketing';

  @override
  String get teamDialogNameRequired => 'Tên nhóm là bắt buộc.';

  @override
  String get teamDialogDescriptionLabel => 'Mô tả';

  @override
  String get teamDialogDescriptionPlaceholder => 'Nhóm này dùng để làm gì?';

  @override
  String get teamDialogAvatarLabel => 'Ảnh đại diện nhóm (tuỳ chọn)';

  @override
  String get teamDialogVisibilityLabel => 'Quyền riêng tư';

  @override
  String get teamDialogVisibilityPrivate => 'Riêng tư';

  @override
  String get teamDialogVisibilityPrivateHint =>
      'Chỉ thành viên được mời mới thấy và tham gia.';

  @override
  String get teamDialogVisibilityPublic => 'Công khai';

  @override
  String get teamDialogVisibilityPublicHint =>
      'Mọi người trong workspace đều có thể tìm thấy nhóm.';

  @override
  String get teamDialogInviteLabel => 'Mời thành viên (tuỳ chọn)';

  @override
  String get teamDialogInvitePlaceholder => 'Nhập email rồi nhấn Enter';

  @override
  String get teamDialogInviteHint =>
      'Lời mời được gửi qua email. Bạn cũng có thể mời sau.';

  @override
  String get teamDialogInviteInvalid => 'Địa chỉ email không hợp lệ.';

  @override
  String get teamDialogSubmit => 'Tạo nhóm';

  @override
  String get teamDialogCreating => 'Đang tạo…';

  @override
  String get teamDialogCreateError => 'Tạo nhóm thất bại. Vui lòng thử lại.';

  @override
  String get teamsListTitle => 'Danh sách nhóm';

  @override
  String teamsListCountLabel(Object count) {
    return '$count nhóm';
  }

  @override
  String get teamsListLoading => 'Đang tải danh sách nhóm…';

  @override
  String teamsListError(Object message) {
    return 'Tải thất bại: $message';
  }

  @override
  String get teamsListEmptyTitle => 'Chưa có nhóm nào';

  @override
  String get teamsListEmptyHelp =>
      'Bấm nút + ở mục Đội nhóm trên sidebar để tạo nhóm đầu tiên.';

  @override
  String get teamsListLoadMore => 'Tải thêm';

  @override
  String get teamsListLoadingMore => 'Đang tải…';

  @override
  String get teamsListEndOfList => 'Đã hiển thị hết danh sách.';

  @override
  String teamsListCardMembersCount(Object count) {
    return '$count thành viên';
  }

  @override
  String get teamsListCardVisibilityPrivate => 'Riêng tư';

  @override
  String get teamsListCardVisibilityPublic => 'Công khai';

  @override
  String get teamsListCardRoleOwner => 'Chủ nhóm';

  @override
  String get teamsListCardRoleAdmin => 'Quản trị';

  @override
  String get teamsListCardRoleMember => 'Thành viên';

  @override
  String get teamsListDeleteAria => 'Xoá nhóm';

  @override
  String get teamsListDeleteTitle => 'Xoá nhóm';

  @override
  String teamsListDeleteMessage(Object name) {
    return 'Bạn có muốn xoá Team \"$name\" này không? Hành động này không thể hoàn tác.';
  }

  @override
  String get teamsListDeleteConfirmWord => 'XOA';

  @override
  String teamsListDeleteConfirmPrompt(Object word) {
    return 'Nhập $word để xác nhận xoá.';
  }

  @override
  String teamsListDeletePlaceholder(Object word) {
    return 'Nhập $word';
  }

  @override
  String get teamsListDeleteSubmit => 'Xoá nhóm';

  @override
  String get teamsListDeleting => 'Đang xoá…';

  @override
  String get teamsListDeleteError => 'Xoá nhóm thất bại. Vui lòng thử lại.';

  @override
  String get membersListTitle => 'Danh sách thành viên';

  @override
  String get membersListSubtitle => 'Toàn bộ người dùng trong hệ thống';

  @override
  String membersListCountLabel(Object count) {
    return '$count người dùng';
  }

  @override
  String get membersListSearchPlaceholder => 'Tìm theo tên hoặc email…';

  @override
  String get membersListLoading => 'Đang tải danh sách thành viên…';

  @override
  String membersListError(Object message) {
    return 'Tải thất bại: $message';
  }

  @override
  String get membersListEmptyTitle => 'Chưa có người dùng nào';

  @override
  String get membersListEmptyHelp => 'Không có dữ liệu người dùng.';

  @override
  String get membersListEmptyHelpSearch =>
      'Không tìm thấy người dùng khớp từ khóa.';

  @override
  String get membersListLoadMore => 'Tải thêm';

  @override
  String get membersListLoadingMore => 'Đang tải…';

  @override
  String get membersListEndOfList => 'Đã hiển thị hết danh sách.';

  @override
  String get membersListRoleAdmin => 'Quản trị viên';

  @override
  String get membersListRoleUser => 'Khách hàng';

  @override
  String membersListTeamCountLabel(Object count) {
    return '$count nhóm';
  }

  @override
  String get membersListVerified => 'Đã xác thực';

  @override
  String get membersListUnverified => 'Chưa xác thực';

  @override
  String get membersListYou => 'Bạn';

  @override
  String get membersListActionEdit => 'Sửa';

  @override
  String get membersListActionManageTeams => 'Quản lý nhóm';

  @override
  String get membersListEditTitle => 'Sửa người dùng';

  @override
  String get membersListEditDesc =>
      'Cập nhật tên hiển thị và vai trò hệ thống.';

  @override
  String get membersListEditNameLabel => 'Tên hiển thị';

  @override
  String get membersListEditNamePlaceholder => 'Nhập tên hiển thị';

  @override
  String get membersListEditRoleLabel => 'Vai trò hệ thống';

  @override
  String get membersListEditRoleAdmin => 'Quản trị viên';

  @override
  String get membersListEditRoleUser => 'Khách hàng';

  @override
  String get membersListEditSubmit => 'Lưu thay đổi';

  @override
  String get membersListEditError => 'Cập nhật thất bại. Vui lòng thử lại.';

  @override
  String membersListTeamsTitle(Object name) {
    return 'Nhóm của $name';
  }

  @override
  String get membersListTeamsDesc => 'Thêm hoặc gỡ người dùng khỏi các nhóm.';

  @override
  String get membersListTeamsLoading => 'Đang tải nhóm…';

  @override
  String get membersListTeamsEmpty => 'Người dùng chưa thuộc nhóm nào.';

  @override
  String get membersListTeamsOwnerBadge => 'Chủ nhóm';

  @override
  String get membersListTeamsRoleAdmin => 'Quản trị';

  @override
  String get membersListTeamsRoleMember => 'Thành viên';

  @override
  String get membersListTeamsRemove => 'Gỡ khỏi nhóm';

  @override
  String get membersListTeamsRemoveError =>
      'Gỡ khỏi nhóm thất bại. Vui lòng thử lại.';

  @override
  String get membersListTeamsRemoving => 'Đang gỡ…';

  @override
  String get membersListTeamsAddTitle => 'Thêm vào nhóm';

  @override
  String get membersListTeamsSelectTeamLabel => 'Chọn nhóm';

  @override
  String get membersListTeamsSelectTeamPlaceholder => '— Chọn một nhóm —';

  @override
  String get membersListTeamsSearchPlaceholder => 'Tìm nhóm…';

  @override
  String get membersListTeamsNoTeams => 'Không có nhóm phù hợp.';

  @override
  String get membersListTeamsAddRoleLabel => 'Vai trò trong nhóm';

  @override
  String get membersListTeamsAddRoleMember => 'Thành viên';

  @override
  String get membersListTeamsAddRoleAdmin => 'Quản trị';

  @override
  String get membersListTeamsAddSubmit => 'Thêm vào nhóm';

  @override
  String get membersListTeamsAdding => 'Đang thêm…';

  @override
  String get membersListTeamsAddError =>
      'Thêm vào nhóm thất bại. Vui lòng thử lại.';

  @override
  String get teamDetailLoading => 'Đang tải nhóm…';

  @override
  String teamDetailError(Object message) {
    return 'Tải thất bại: $message';
  }

  @override
  String get teamDetailNotFound => 'Không tìm thấy nhóm.';

  @override
  String get teamDetailVisibilityPrivate => 'Riêng tư';

  @override
  String get teamDetailVisibilityPublic => 'Công khai';

  @override
  String get teamDetailMembersTitle => 'Thành viên';

  @override
  String teamDetailMembersCount(Object count) {
    return '$count thành viên';
  }

  @override
  String get teamDetailRoleOwner => 'Chủ nhóm';

  @override
  String get teamDetailRoleAdmin => 'Quản trị';

  @override
  String get teamDetailRoleMember => 'Thành viên';

  @override
  String get teamDetailYou => 'Bạn';

  @override
  String get teamDetailMakeAdmin => 'Đặt làm quản trị';

  @override
  String get teamDetailMakeMember => 'Đặt làm thành viên';

  @override
  String get teamDetailRemoveMember => 'Xoá';

  @override
  String get teamDetailRemoveConfirm => 'Xoá thành viên này khỏi nhóm?';

  @override
  String get teamDetailLeaveTeam => 'Rời nhóm';

  @override
  String get teamDetailLeaveConfirm => 'Bạn có chắc muốn rời khỏi nhóm này?';

  @override
  String get teamDetailInviteTitle => 'Thêm / mời thành viên';

  @override
  String get teamDetailInvitePlaceholder => 'Nhập email rồi nhấn Enter';

  @override
  String get teamDetailInviteHint =>
      'Lời mời được gửi qua email. Email đã thêm sẽ hiển thị ở danh sách chờ bên dưới.';

  @override
  String get teamDetailInviteSubmit => 'Gửi lời mời';

  @override
  String get teamDetailInviteSending => 'Đang gửi…';

  @override
  String get teamDetailInviteInvalid => 'Địa chỉ email không hợp lệ.';

  @override
  String get teamDetailInviteError => 'Gửi lời mời thất bại. Vui lòng thử lại.';

  @override
  String get teamDetailPendingTitle => 'Lời mời đang chờ';

  @override
  String get teamDetailPendingEmpty => 'Không có lời mời nào đang chờ.';

  @override
  String get teamDetailStatusPending => 'Đang chờ';

  @override
  String get teamDetailCancelInvite => 'Huỷ';

  @override
  String get teamDetailProjectsTitle => 'Dự án';

  @override
  String get teamDetailProjectsEmpty => 'Chưa có dự án nào trong nhóm này.';

  @override
  String get teamDetailAddProject => 'Thêm dự án';

  @override
  String get teamDetailRemoveProject => 'Gỡ';

  @override
  String get teamDetailRemoveProjectConfirm => 'Gỡ dự án này khỏi nhóm?';

  @override
  String get teamDetailAddProjectTitle => 'Thêm dự án vào nhóm';

  @override
  String get teamDetailAddProjectDesc =>
      'Chọn một dự án của bạn để thêm vào nhóm này.';

  @override
  String get teamDetailAddProjectEmpty => 'Bạn không có dự án nào để thêm.';

  @override
  String get teamDetailAddProjectSubmit => 'Thêm';

  @override
  String get teamDetailAddingProject => 'Đang thêm…';

  @override
  String get teamDetailAddProjectError =>
      'Thêm dự án thất bại. Vui lòng thử lại.';

  @override
  String get invitePageTitle => 'Lời mời tham gia nhóm';

  @override
  String get invitePageDescription =>
      'Bạn được mời tham gia một nhóm. Chấp nhận để trở thành thành viên.';

  @override
  String get invitePageMissingToken =>
      'Link lời mời không hợp lệ hoặc thiếu thông tin.';

  @override
  String get invitePageSignInRequired =>
      'Vui lòng đăng nhập để chấp nhận lời mời này.';

  @override
  String get invitePageSignInButton => 'Đăng nhập';

  @override
  String get invitePageAccept => 'Chấp nhận lời mời';

  @override
  String get invitePageAccepting => 'Đang xử lý…';

  @override
  String get invitePageSuccessTitle => 'Bạn đã tham gia nhóm!';

  @override
  String get invitePageSuccessDesc => 'Bạn giờ là thành viên của nhóm này.';

  @override
  String get invitePageGoToTeam => 'Tới trang nhóm';

  @override
  String get invitePageErrorTitle => 'Không thể chấp nhận lời mời';

  @override
  String get invitePageBackToTeams => 'Về danh sách nhóm';

  @override
  String get tasksTitle => 'Quản lý Task';

  @override
  String get tasksCreateNew => 'Tạo task mới';

  @override
  String get tasksCreateShort => 'Tạo task';

  @override
  String get tasksFilterAll => 'Tất cả';

  @override
  String get tasksSearchPlaceholder =>
      'Tìm task theo tên, tag, người phụ trách…';

  @override
  String get tasksLoading => 'Đang tải dữ liệu…';

  @override
  String tasksErrorPrefix(Object message) {
    return 'Lỗi: $message';
  }

  @override
  String get tasksEmptyTitle => 'Không có task nào';

  @override
  String get tasksEmptyHelp =>
      'Tạo task đầu tiên để bắt đầu quản lý công việc.';

  @override
  String get tasksEmptyHelpSearch => 'Thử từ khoá khác hoặc xoá bộ lọc.';

  @override
  String get tasksStatusPending => 'Chưa thực hiện';

  @override
  String get tasksStatusInProgress => 'Đang thực hiện';

  @override
  String get tasksStatusCompleted => 'Đã hoàn thành';

  @override
  String tasksPriorityLabel(Object value) {
    return 'Ưu tiên: $value';
  }

  @override
  String get tasksPriorityLow => 'Thấp';

  @override
  String get tasksPriorityMedium => 'Trung bình';

  @override
  String get tasksPriorityHigh => 'Cao';

  @override
  String get taskDialogCreateTitle => 'Tạo Task mới';

  @override
  String get taskDialogEditTitle => 'Sửa Task';

  @override
  String get taskDialogDescription => 'Nhập thông tin chi tiết của Task.';

  @override
  String get taskDialogNoLabel => 'Số No';

  @override
  String get taskDialogNoPlaceholder => 'VD: 6';

  @override
  String get taskDialogNoRequired => 'Số No là bắt buộc.';

  @override
  String get taskDialogNoInvalid => 'Số No phải là số nguyên dương.';

  @override
  String get taskDialogNoMustGtZero => 'Số No phải lớn hơn 0.';

  @override
  String taskDialogNoDuplicate(Object value) {
    return 'Số No #$value đã tồn tại trong dự án.';
  }

  @override
  String taskDialogNoHint(Object value) {
    return 'Gợi ý: #$value';
  }

  @override
  String get taskDialogTitleLabel => 'Tiêu đề';

  @override
  String get taskDialogTitlePlaceholder => 'VD: Hoàn thành báo cáo tuần';

  @override
  String get taskDialogTitleRequired => 'Tiêu đề là bắt buộc.';

  @override
  String get taskDialogDescriptionLabel => 'Mô tả';

  @override
  String get taskDialogDescriptionPlaceholder => 'Chi tiết công việc, ghi chú…';

  @override
  String get taskDialogStatusLabel => 'Trạng thái';

  @override
  String get taskDialogPriorityLabel => 'Mức ưu tiên';

  @override
  String get taskDialogStartDateLabel => 'Ngày bắt đầu';

  @override
  String get taskDialogDueDateLabel => 'Hạn chót';

  @override
  String get taskDialogAssigneeLabel => 'Người phụ trách';

  @override
  String get taskDialogAssigneePlaceholder => 'VD: Dung';

  @override
  String get taskDialogTagsLabel => 'Tags (phân cách bằng dấu phẩy)';

  @override
  String get taskDialogTagsPlaceholder => 'backend, urgent';

  @override
  String get taskDialogThumbnailLabel => 'Thumbnail (tuỳ chọn)';

  @override
  String get taskDialogSubmitCreate => 'Tạo task';

  @override
  String get taskDialogSubmitEdit => 'Lưu thay đổi';

  @override
  String taskItemAriaNumber(Object value) {
    return 'Task số $value';
  }

  @override
  String taskItemAriaComments(Object count) {
    return '$count bình luận';
  }

  @override
  String get taskItemAriaEdit => 'Sửa task';

  @override
  String get taskItemAriaDelete => 'Xoá task';

  @override
  String get taskDetailBack => 'Quay lại';

  @override
  String get taskDetailEdit => 'Sửa';

  @override
  String get taskDetailDelete => 'Xoá';

  @override
  String get taskDetailAssignee => 'Người phụ trách:';

  @override
  String get taskDetailStartDate => 'Bắt đầu:';

  @override
  String get taskDetailDueDate => 'Hạn:';

  @override
  String get taskDetailOverdue => 'Quá hạn';

  @override
  String get taskDetailTags => 'Tags:';

  @override
  String get taskDetailDescriptionHeading => 'Mô tả';

  @override
  String get taskDetailNoDescription => 'Chưa có mô tả.';

  @override
  String taskDetailPriorityWithLabel(Object value) {
    return 'Ưu tiên: $value';
  }

  @override
  String get taskDetailDeleteConfirm => 'Xoá task này?';

  @override
  String get commentsTitle => 'Bình luận';

  @override
  String get commentsYourComment => 'Bình luận của bạn';

  @override
  String get commentsPlaceholder => 'Nhập bình luận…';

  @override
  String get commentsAttach => 'Đính kèm';

  @override
  String get commentsAttachOnlyFallback => '(file đính kèm)';

  @override
  String get commentsUserFallback => 'Người dùng';

  @override
  String commentsRemoveFile(Object name) {
    return 'Bỏ file $name';
  }

  @override
  String commentsMaxPerComment(Object count) {
    return 'Tối đa $count file mỗi bình luận.';
  }

  @override
  String get commentsLoading => 'Đang tải bình luận…';

  @override
  String get commentsEmpty => 'Chưa có bình luận nào. Hãy là người đầu tiên!';

  @override
  String get commentsReply => 'Trả lời';

  @override
  String get commentsEdit => 'Sửa';

  @override
  String get commentsDelete => 'Xoá';

  @override
  String get commentsDeleteConfirm => 'Xoá bình luận này?';

  @override
  String get commentsSend => 'Gửi bình luận';

  @override
  String get commentsSending => 'Đang gửi…';

  @override
  String get commentsSendReply => 'Gửi trả lời';

  @override
  String commentsReplyingTo(Object name) {
    return 'Trả lời @$name';
  }

  @override
  String commentsReplyPlaceholder(Object name) {
    return 'Trả lời @$name…';
  }

  @override
  String get commentsCancel => 'Huỷ';

  @override
  String get commentsSave => 'Lưu';

  @override
  String get commentsEdited => ' (đã sửa)';

  @override
  String get commentsOpenPdfTitle => 'Mở PDF trong tab mới';

  @override
  String commentsDownloadTitle(Object name, Object size) {
    return 'Tải về: $name ($size)';
  }

  @override
  String attachmentsErrorEmpty(Object name) {
    return 'File \"$name\" rỗng.';
  }

  @override
  String attachmentsErrorTooLarge(Object name, Object limit) {
    return 'File \"$name\" vượt giới hạn ${limit}MB.';
  }

  @override
  String attachmentsErrorBlocked(Object ext) {
    return 'Định dạng .$ext không được phép.';
  }

  @override
  String attachmentsErrorUnsupported(Object ext) {
    return 'Định dạng .$ext không được hỗ trợ.';
  }

  @override
  String attachmentsErrorBadMime(Object mime, Object name) {
    return 'MIME \"$mime\" của file \"$name\" không được hỗ trợ.';
  }

  @override
  String get fileInputPickImage => 'Chọn ảnh';

  @override
  String get fileInputChangeImage => 'Đổi ảnh';

  @override
  String get fileInputClear => 'Bỏ chọn';

  @override
  String get fileInputHelper => 'JPG/PNG/WEBP/GIF, tối đa 5MB';

  @override
  String get fileInputErrorInvalidType => 'Chỉ hỗ trợ JPG/PNG/WEBP/GIF.';

  @override
  String get fileInputErrorTooLarge => 'File quá lớn (tối đa 5MB).';

  @override
  String get imageLightboxClose => 'Đóng';

  @override
  String get settingsTitle => 'Cài đặt';

  @override
  String get settingsSubtitle => 'Quản lý giao diện và ngôn ngữ hiển thị.';

  @override
  String get settingsSectionAppearance => 'Giao diện';

  @override
  String get settingsTheme => 'Chủ đề';

  @override
  String get settingsThemeLight => 'Sáng';

  @override
  String get settingsThemeDark => 'Tối';

  @override
  String get settingsThemeSystem => 'Theo hệ thống';

  @override
  String get settingsSectionLanguage => 'Ngôn ngữ';

  @override
  String get settingsLanguage => 'Ngôn ngữ hiển thị';

  @override
  String get settingsLanguageHelp =>
      'Chọn ngôn ngữ dùng cho toàn bộ giao diện.';

  @override
  String get languagesEn => 'English';

  @override
  String get languagesVi => 'Tiếng Việt';

  @override
  String get languagesJa => '日本語';

  @override
  String get breadcrumbsDashboard => 'Dashboard';

  @override
  String get breadcrumbsProjectFallback => 'Dự án';

  @override
  String get breadcrumbsTaskFallback => 'Task';

  @override
  String get breadcrumbsTask => 'Task';

  @override
  String get breadcrumbsSettings => 'Cài đặt';

  @override
  String get pagesTaskLoading => 'Đang tải task…';

  @override
  String get pagesTaskErrorFallback => 'Không tải được task.';

  @override
  String get taskImagesLabel => 'Hình ảnh';

  @override
  String get taskImagesHint =>
      'Kéo để đổi thứ tự · Ảnh đầu tiên là ảnh đại diện';

  @override
  String get taskImagesCover => 'Ảnh đại diện';

  @override
  String get taskImagesSetCover => 'Đặt làm ảnh đại diện';

  @override
  String get taskImagesRemove => 'Bỏ ảnh';

  @override
  String get taskImagesAdd => 'Thêm ảnh';

  @override
  String get taskImagesAddHint => 'Kéo thả hoặc bấm';

  @override
  String taskImagesLimitReached(Object count) {
    return 'Đã đủ $count ảnh';
  }

  @override
  String taskImagesTooLarge(Object name) {
    return '$name: vượt quá 5MB';
  }

  @override
  String taskImagesBadType(Object name) {
    return '$name: định dạng không hỗ trợ (JPG/PNG/WEBP/GIF)';
  }

  @override
  String taskImagesTooMany(Object count) {
    return 'Chỉ thêm được tối đa $count ảnh nữa';
  }

  @override
  String taskImagesUploading(Object done, Object total) {
    return 'Đang tải ảnh lên $done/$total…';
  }

  @override
  String taskImagesUploadFailed(Object count) {
    return '$count ảnh tải lên thất bại. Task đã được lưu — bạn có thể thêm lại ảnh sau.';
  }

  @override
  String get taskImagesClose => 'Đóng';

  @override
  String get taskImagesPrev => 'Ảnh trước';

  @override
  String get taskImagesNext => 'Ảnh sau';

  @override
  String get taskImagesOpenFull => 'Xem toàn màn hình';

  @override
  String taskImagesImageCount(Object count) {
    return '$count ảnh';
  }

  @override
  String get mobileNotificationsSubtitle =>
      'Cập nhật về các task trong dự án của bạn.';

  @override
  String get mobileNotificationsAssigned => 'Được giao cho bạn';

  @override
  String get mobileNotificationsEmpty => 'Không có thông báo mới.';

  @override
  String get mobileConfigMissingTitle => 'Thiếu cấu hình Firebase';

  @override
  String get mobileConfigMissingDesc =>
      'Chạy app với --dart-define-from-file=config/firebase.json (xem mobile/README.md).';

  @override
  String get mobileOpenFile => 'Mở file';

  @override
  String get mobilePickFromGallery => 'Chọn từ thư viện';

  @override
  String get mobileTakePhoto => 'Chụp ảnh';

  @override
  String get mobilePickFiles => 'Chọn file';

  @override
  String get mobileProfileTitle => 'Tài khoản';

  @override
  String get accessRoleAdmin => 'Quản trị viên';

  @override
  String get accessRoleCustomer => 'Khách hàng';

  @override
  String get accessNoPermissionTitle => 'Bạn không có quyền truy cập trang này';

  @override
  String get accessNoPermissionDesc =>
      'Trang này chỉ dành cho quản trị viên. Nếu bạn cần quyền truy cập, vui lòng liên hệ quản trị viên.';

  @override
  String get accessBackToDashboard => 'Về Dashboard';

  @override
  String get accessDeniedLogin =>
      'Tài khoản của bạn chưa được cấp quyền hoặc đã bị khoá.';

  @override
  String get accessContactAdmin =>
      'Vui lòng liên hệ quản trị viên để được hỗ trợ.';

  @override
  String get accessCreateAccount => 'Tạo tài khoản';

  @override
  String get accessCreateTitle => 'Tạo tài khoản mới';

  @override
  String get accessCreateDesc =>
      'Hệ thống sẽ gửi email kèm link đặt mật khẩu cho người dùng.';

  @override
  String get accessEmailLabel => 'Email';

  @override
  String get accessEmailPlaceholder => 'khachhang@congty.com';

  @override
  String get accessNameLabel => 'Tên hiển thị';

  @override
  String get accessNamePlaceholder => 'VD: Nguyễn Văn A';

  @override
  String get accessRoleLabel => 'Vai trò';

  @override
  String get accessRoleCustomerHint => 'Chỉ thấy dự án được gán';

  @override
  String get accessRoleAdminHint => 'Toàn quyền hệ thống';

  @override
  String get accessProjectsLabel => 'Dự án được truy cập';

  @override
  String get accessProjectsHint =>
      'Khách hàng chỉ nhìn thấy các dự án được chọn ở đây.';

  @override
  String get accessNoProjectsAvailable => 'Chưa có dự án nào.';

  @override
  String get accessCreating => 'Đang tạo…';

  @override
  String get accessCreateSubmit => 'Tạo tài khoản';

  @override
  String get accessCreateError => 'Không tạo được tài khoản.';

  @override
  String get accessCreatedTitle => 'Đã tạo tài khoản';

  @override
  String accessCreatedEmailSent(Object email) {
    return 'Email đặt mật khẩu đã được gửi tới $email.';
  }

  @override
  String accessCreatedEmailFailed(Object email) {
    return 'Không gửi được email tới $email. Hãy copy link bên dưới và gửi cho người dùng.';
  }

  @override
  String get accessSetPasswordLink => 'Link đặt mật khẩu';

  @override
  String get accessCopy => 'Copy';

  @override
  String get accessCopied => 'Đã copy';

  @override
  String get accessDone => 'Xong';

  @override
  String get accessActionProjects => 'Dự án';

  @override
  String get accessActionLock => 'Khoá';

  @override
  String get accessActionUnlock => 'Mở khoá';

  @override
  String get accessActionResendLink => 'Gửi lại link';

  @override
  String accessLockConfirm(Object email) {
    return 'Khoá tài khoản $email? Người dùng sẽ không thể đăng nhập cho tới khi được mở khoá.';
  }

  @override
  String accessUnlockConfirm(Object email) {
    return 'Mở khoá tài khoản $email?';
  }

  @override
  String get accessStatusDisabled => 'Đã khoá';

  @override
  String accessProjectCountLabel(Object count) {
    return '$count dự án';
  }

  @override
  String get accessResendTitle => 'Link đặt mật khẩu mới';

  @override
  String get accessResendError => 'Không tạo được link đặt mật khẩu.';

  @override
  String accessUserProjectsTitle(Object name) {
    return 'Dự án của $name';
  }

  @override
  String get accessUserProjectsDesc =>
      'Chọn các dự án người dùng này được truy cập.';

  @override
  String get accessSearchProjects => 'Tìm dự án…';

  @override
  String get accessSaveProjects => 'Lưu';

  @override
  String get accessSaveError => 'Không lưu được.';

  @override
  String accessSelectedCount(Object count) {
    return 'Đã chọn $count';
  }

  @override
  String get accessProjectMembers => 'Thành viên dự án';

  @override
  String accessProjectMembersCount(Object count) {
    return '$count thành viên';
  }

  @override
  String get accessManageMembers => 'Quản lý';

  @override
  String get accessMembersDialogTitle => 'Thành viên dự án';

  @override
  String get accessMembersDialogDesc =>
      'Chỉ thành viên được gán mới nhìn thấy và làm việc trong dự án này.';

  @override
  String get accessAddMemberTitle => 'Thêm thành viên';

  @override
  String get accessSearchUsers => 'Tìm theo tên hoặc email…';

  @override
  String get accessNoMembers => 'Chưa có thành viên nào.';

  @override
  String get accessNoCandidates => 'Không tìm thấy người dùng phù hợp.';

  @override
  String get accessRemoveMember => 'Gỡ khỏi dự án';

  @override
  String get accessMemberError => 'Thao tác thất bại.';

  @override
  String get accessAssigneeNone => '— Chưa giao —';

  @override
  String get accessColUser => 'Người dùng';

  @override
  String get accessColRole => 'Vai trò';

  @override
  String get accessColStatus => 'Trạng thái';

  @override
  String get accessColAccess => 'Quyền truy cập';

  @override
  String get accessColCreated => 'Ngày tạo';

  @override
  String get accessColActions => 'Thao tác';

  @override
  String get accessStatusActive => 'Hoạt động';

  @override
  String get accessMoreActions => 'Thao tác khác';

  @override
  String get dashboardTitle => 'Tổng quan';

  @override
  String get dashboardSubtitle =>
      'Bức tranh tổng thể về dự án và công việc của bạn.';

  @override
  String get dashboardStatTotalProjects => 'Tổng dự án';

  @override
  String get dashboardStatTotalTasks => 'Tổng task';

  @override
  String get dashboardStatInProgress => 'Đang thực hiện';

  @override
  String get dashboardStatCompleted => 'Đã hoàn thành';

  @override
  String dashboardStatCompletionPct(Object value) {
    return 'Tỉ lệ hoàn thành $value%';
  }

  @override
  String get dashboardSectionOverdue => 'Quá hạn';

  @override
  String get dashboardSectionUpcoming => 'Sắp đến hạn';

  @override
  String dashboardUpcomingWindow(Object days) {
    return '$days ngày tới';
  }

  @override
  String get dashboardSectionRecent => 'Hoạt động gần đây';

  @override
  String get dashboardSectionActiveProjects => 'Dự án nổi bật';

  @override
  String get dashboardViewAll => 'Xem tất cả';

  @override
  String get dashboardEmptyOverdue => 'Không có task nào quá hạn. Tuyệt vời!';

  @override
  String get dashboardEmptyUpcoming =>
      'Không có task nào tới hạn trong tuần tới.';

  @override
  String get dashboardEmptyRecent => 'Chưa có hoạt động gần đây.';

  @override
  String get dashboardEmptyProjects => 'Chưa có dự án nào.';

  @override
  String get dashboardEmptyProjectsCta => 'Tạo dự án đầu tiên';

  @override
  String get dashboardDueToday => 'Hôm nay tới hạn';

  @override
  String get dashboardDueTomorrow => 'Ngày mai tới hạn';

  @override
  String dashboardDueInDays(Object days) {
    return 'Còn $days ngày';
  }

  @override
  String dashboardOverdueByDays(Object days) {
    return 'Quá hạn $days ngày';
  }

  @override
  String get dashboardLoading => 'Đang tải dữ liệu…';

  @override
  String dashboardError(Object message) {
    return 'Lỗi: $message';
  }

  @override
  String get dashboardSectionStatusDistribution => 'Phân bố trạng thái';

  @override
  String get dashboardSectionTopProjects => 'Top dự án theo số task';

  @override
  String get dashboardSectionPriorityBreakdown => 'Phân bố ưu tiên';

  @override
  String get dashboardChartTasksLabel => 'Task';

  @override
  String get dashboardChartNoData => 'Chưa đủ dữ liệu để hiển thị biểu đồ.';

  @override
  String get dashboardChartTotalLabel => 'Tổng';
}
