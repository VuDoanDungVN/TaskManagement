// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get commonSave => '保存';

  @override
  String get commonCancel => 'キャンセル';

  @override
  String get commonEdit => '編集';

  @override
  String get commonDelete => '削除';

  @override
  String get commonSaving => '保存中…';

  @override
  String get commonSending => '送信中…';

  @override
  String get commonDeleting => '削除中…';

  @override
  String get commonLoading => '読み込み中…';

  @override
  String get commonError => 'エラー';

  @override
  String get commonBack => '戻る';

  @override
  String get commonSearch => '検索';

  @override
  String get commonOptional => '（任意）';

  @override
  String get commonClose => '閉じる';

  @override
  String get commonRetry => '再試行';

  @override
  String get navAppName => 'Task Management';

  @override
  String get navSectionOverview => '概要';

  @override
  String get navDashboard => 'ダッシュボード';

  @override
  String get navAnalytics => '分析';

  @override
  String get navOrganization => '組織';

  @override
  String get navProjects => 'プロジェクト';

  @override
  String get navSectionFinance => '財務';

  @override
  String get navTransactions => '取引';

  @override
  String get navInvoices => '請求書';

  @override
  String get navPayments => '支払い';

  @override
  String get navSectionTeam => 'チーム';

  @override
  String get navCreateTeam => 'チームを作成';

  @override
  String get navTeamList => 'チーム';

  @override
  String get navMembers => 'メンバー';

  @override
  String get navPermissions => '権限';

  @override
  String get navChat => 'チャット';

  @override
  String get navMeetings => '会議';

  @override
  String get navSettings => '設定';

  @override
  String get navHelp => 'ヘルプ';

  @override
  String get topnavOpenSidebar => 'サイドバーを開く';

  @override
  String get topnavCloseSidebar => 'サイドバーを閉じる';

  @override
  String get topnavBreadcrumb => 'パンくず';

  @override
  String get topnavOpenUserMenu => 'ユーザーメニューを開く';

  @override
  String get topnavSignIn => 'ログイン';

  @override
  String get topnavThemeLight => 'ライト';

  @override
  String get topnavThemeDark => 'ダーク';

  @override
  String get topnavThemeSystem => 'システム';

  @override
  String get topnavLanguage => '言語';

  @override
  String get authLoginTitle => 'ログイン';

  @override
  String get authLoginSubtitle => 'Task Management へおかえりなさい';

  @override
  String get authLoginEmailLabel => 'メールアドレス';

  @override
  String get authLoginEmailPlaceholder => 'you@taskmanagement.app';

  @override
  String get authLoginPasswordLabel => 'パスワード';

  @override
  String get authLoginPasswordPlaceholder => '••••••••';

  @override
  String get authLoginForgotPassword => 'パスワードをお忘れですか？';

  @override
  String get authLoginShowPassword => 'パスワードを表示';

  @override
  String get authLoginHidePassword => 'パスワードを非表示';

  @override
  String get authLoginSubmit => 'ログイン';

  @override
  String get authLoginSubmitting => 'ログイン中…';

  @override
  String get authLoginNoAccount => 'アカウントがありませんか？';

  @override
  String get authLoginRegister => '登録';

  @override
  String get authLoginFirebaseNotConfigured =>
      'Firebase が設定されていません。.env.local.example を参考に .env.local を作成してください。';

  @override
  String get authLoginForgotEmailPrompt =>
      '上の欄にメールアドレスを入力してから「パスワードをお忘れですか？」を押してリセットリンクを受け取ってください。';

  @override
  String get authLoginResetEmailSent => 'パスワードリセットメールを送信しました。受信トレイをご確認ください。';

  @override
  String get authRegisterTitle => 'アカウント作成';

  @override
  String get authRegisterSubtitle => 'プロジェクトとタスクの管理を始めましょう';

  @override
  String get authRegisterFullNameLabel => '氏名';

  @override
  String get authRegisterFullNamePlaceholder => '例：山田 太郎';

  @override
  String get authRegisterEmailLabel => 'メールアドレス';

  @override
  String get authRegisterEmailPlaceholder => 'you@taskmanagement.app';

  @override
  String get authRegisterPasswordLabel => 'パスワード';

  @override
  String get authRegisterPasswordPlaceholder => '6文字以上';

  @override
  String get authRegisterConfirmLabel => 'パスワード（確認）';

  @override
  String get authRegisterConfirmPlaceholder => 'パスワードを再入力';

  @override
  String get authRegisterSubmit => '登録';

  @override
  String get authRegisterSubmitting => 'アカウント作成中…';

  @override
  String get authRegisterDisclaimer =>
      'アカウントを作成することで、Task Management の利用規約とポリシーに同意したものとみなされます。';

  @override
  String get authRegisterHaveAccount => 'すでにアカウントをお持ちですか？';

  @override
  String get authRegisterLogin => 'ログイン';

  @override
  String get authRegisterErrorsFullNameRequired => '氏名を入力してください。';

  @override
  String get authRegisterErrorsEmailRequired => 'メールアドレスを入力してください。';

  @override
  String get authRegisterErrorsPasswordMinLength => 'パスワードは6文字以上で入力してください。';

  @override
  String get authRegisterErrorsConfirmMismatch => '確認用パスワードが一致しません。';

  @override
  String get authRegisterErrorsFirebaseNotConfigured =>
      'Firebase が設定されていません。.env.local.example を参考に .env.local を作成してください。';

  @override
  String get authVerifyTitle => 'メール認証';

  @override
  String get authVerifySubtitle => '認証リンクを送信しました：';

  @override
  String get authVerifyInstruction =>
      'メールを開き、認証リンクをクリックしてから、ここに戻って「認証完了」を押してください。迷惑メールフォルダもご確認ください。';

  @override
  String get authVerifyChecking => '確認中…';

  @override
  String get authVerifyIVerified => '認証完了';

  @override
  String authVerifyResendCountdown(Object seconds) {
    return '$seconds秒後に再送可能';
  }

  @override
  String get authVerifyResend => '認証メールを再送';

  @override
  String get authVerifySignOutAndSwitch => 'ログアウトして別のアカウントを使用';

  @override
  String get authVerifySuccess => '認証完了！リダイレクトしています…';

  @override
  String get authVerifyStillNotVerified =>
      'メールがまだ認証されていません。リンクをクリックしたことを確認してください。他のデバイスで開いた場合は、ログアウトしてから再度ログインして更新してください。';

  @override
  String get authVerifyResent => '認証メールを再送しました。受信トレイ（迷惑メールも含む）をご確認ください。';

  @override
  String get profileStatusActive => 'オンライン';

  @override
  String get profileStatusAway => '退席中';

  @override
  String get profileStatusOffline => 'オフライン';

  @override
  String get profileSectionAccount => 'アカウント';

  @override
  String get profileProfile => 'プロフィール';

  @override
  String get profileSettings => '設定';

  @override
  String get profileNotifications => '通知';

  @override
  String get profileSectionSupport => 'サポート';

  @override
  String get profileHelp => 'ヘルプ';

  @override
  String get profileTerms => '利用規約とポリシー';

  @override
  String get profileChangeAvatar => 'アバターを変更';

  @override
  String get profileSignOut => 'ログアウト';

  @override
  String get profileSigningOut => 'ログアウト中…';

  @override
  String get profileUploadFailed => 'アップロードに失敗しました。';

  @override
  String profileJoinedOn(Object date) {
    return '$date に参加';
  }

  @override
  String get profileEmailVerified => 'メール確認済み';

  @override
  String get profileEmailNotVerified => 'メール未確認';

  @override
  String get profileStatProjects => 'プロジェクト';

  @override
  String get profileStatTeams => 'チーム';

  @override
  String get projectsGuestBannerTitle => 'ゲストモードで閲覧中です';

  @override
  String get projectsGuestBannerDesc =>
      '各プロジェクトのタスク詳細を見たり、新規プロジェクトを作成して業務を管理するにはログインしてください。';

  @override
  String get projectsTitle => 'プロジェクト';

  @override
  String projectsCountLabel(Object count) {
    return '$count 件のプロジェクト';
  }

  @override
  String get projectsCreateNew => '新規プロジェクト';

  @override
  String get projectsSignInToViewTitle => 'プロジェクトを見るにはログイン';

  @override
  String get projectsSignInToViewHelp => '上のバナーからアカウントを作成またはログインしてください。';

  @override
  String get projectsLoading => '読み込み中…';

  @override
  String projectsError(Object message) {
    return 'エラー：$message';
  }

  @override
  String get projectsEmptyTitle => 'プロジェクトがありません';

  @override
  String get projectsEmptyHelp => '最初のプロジェクトを作成して業務管理を始めましょう。';

  @override
  String projectsCardTasksTotal(Object count) {
    return '$count 件のタスク';
  }

  @override
  String projectsCardPendingShort(Object count) {
    return '未着手 $count';
  }

  @override
  String projectsCardInProgressShort(Object count) {
    return '進行中 $count';
  }

  @override
  String projectsCardDoneShort(Object count) {
    return '完了 $count';
  }

  @override
  String get projectsCardProgress => '進捗';

  @override
  String get projectsCardViewDetail => '詳細を見る';

  @override
  String get projectDialogCreateTitle => '新規プロジェクト';

  @override
  String get projectDialogCreateDesc => 'タスク管理を始めるためにプロジェクト情報を入力してください。';

  @override
  String get projectDialogNameLabel => 'プロジェクト名';

  @override
  String get projectDialogNamePlaceholder => '例：ECサイト';

  @override
  String get projectDialogNameRequired => 'プロジェクト名は必須です。';

  @override
  String get projectDialogDescriptionLabel => '説明';

  @override
  String get projectDialogDescriptionPlaceholder => '目的、範囲、全体の期限など…';

  @override
  String get projectDialogThumbnailLabel => 'サムネイル（任意）';

  @override
  String get projectDialogSubmit => 'プロジェクトを作成';

  @override
  String get teamDialogCreateTitle => 'チームを作成';

  @override
  String get teamDialogCreateDesc => 'メンバーと共同作業し、プロジェクトを共有するチームを作成します。';

  @override
  String get teamDialogNameLabel => 'チーム名';

  @override
  String get teamDialogNamePlaceholder => '例：マーケティングチーム';

  @override
  String get teamDialogNameRequired => 'チーム名は必須です。';

  @override
  String get teamDialogDescriptionLabel => '説明';

  @override
  String get teamDialogDescriptionPlaceholder => 'このチームの目的は何ですか？';

  @override
  String get teamDialogAvatarLabel => 'チームのアバター（任意）';

  @override
  String get teamDialogVisibilityLabel => '公開範囲';

  @override
  String get teamDialogVisibilityPrivate => '非公開';

  @override
  String get teamDialogVisibilityPrivateHint => '招待されたメンバーのみが閲覧・参加できます。';

  @override
  String get teamDialogVisibilityPublic => '公開';

  @override
  String get teamDialogVisibilityPublicHint => 'ワークスペース内の誰でもこのチームを見つけられます。';

  @override
  String get teamDialogInviteLabel => 'メンバーを招待（任意）';

  @override
  String get teamDialogInvitePlaceholder => 'メールアドレスを入力してEnterを押す';

  @override
  String get teamDialogInviteHint => '招待はメールで送信されます。後から招待することもできます。';

  @override
  String get teamDialogInviteInvalid => 'メールアドレスが正しくありません。';

  @override
  String get teamDialogSubmit => 'チームを作成';

  @override
  String get teamDialogCreating => '作成中…';

  @override
  String get teamDialogCreateError => 'チームの作成に失敗しました。もう一度お試しください。';

  @override
  String get teamsListTitle => 'チーム一覧';

  @override
  String teamsListCountLabel(Object count) {
    return '$count チーム';
  }

  @override
  String get teamsListLoading => 'チームを読み込み中…';

  @override
  String teamsListError(Object message) {
    return '読み込みに失敗しました：$message';
  }

  @override
  String get teamsListEmptyTitle => 'チームがまだありません';

  @override
  String get teamsListEmptyHelp => 'サイドバーの + ボタンから最初のチームを作成しましょう。';

  @override
  String get teamsListLoadMore => 'もっと読み込む';

  @override
  String get teamsListLoadingMore => '読み込み中…';

  @override
  String get teamsListEndOfList => '最後まで表示しました。';

  @override
  String teamsListCardMembersCount(Object count) {
    return '$count 人のメンバー';
  }

  @override
  String get teamsListCardVisibilityPrivate => '非公開';

  @override
  String get teamsListCardVisibilityPublic => '公開';

  @override
  String get teamsListCardRoleOwner => 'オーナー';

  @override
  String get teamsListCardRoleAdmin => '管理者';

  @override
  String get teamsListCardRoleMember => 'メンバー';

  @override
  String get teamsListDeleteAria => 'チームを削除';

  @override
  String get teamsListDeleteTitle => 'チームを削除';

  @override
  String teamsListDeleteMessage(Object name) {
    return 'チーム「$name」を削除してもよろしいですか？この操作は取り消せません。';
  }

  @override
  String get teamsListDeleteConfirmWord => '削除';

  @override
  String teamsListDeleteConfirmPrompt(Object word) {
    return '$word と入力して削除を確認してください。';
  }

  @override
  String teamsListDeletePlaceholder(Object word) {
    return '$word と入力';
  }

  @override
  String get teamsListDeleteSubmit => 'チームを削除';

  @override
  String get teamsListDeleting => '削除中…';

  @override
  String get teamsListDeleteError => 'チームの削除に失敗しました。もう一度お試しください。';

  @override
  String get membersListTitle => 'メンバー一覧';

  @override
  String get membersListSubtitle => 'システム内の全ユーザー';

  @override
  String membersListCountLabel(Object count) {
    return '$count 人のユーザー';
  }

  @override
  String get membersListSearchPlaceholder => '名前またはメールで検索…';

  @override
  String get membersListLoading => 'メンバーを読み込み中…';

  @override
  String membersListError(Object message) {
    return '読み込みに失敗しました：$message';
  }

  @override
  String get membersListEmptyTitle => 'ユーザーがいません';

  @override
  String get membersListEmptyHelp => 'ユーザーデータがありません。';

  @override
  String get membersListEmptyHelpSearch => '条件に一致するユーザーが見つかりません。';

  @override
  String get membersListLoadMore => 'さらに読み込む';

  @override
  String get membersListLoadingMore => '読み込み中…';

  @override
  String get membersListEndOfList => '一覧の最後です。';

  @override
  String get membersListRoleAdmin => '管理者';

  @override
  String get membersListRoleUser => '顧客';

  @override
  String membersListTeamCountLabel(Object count) {
    return '$count チーム';
  }

  @override
  String get membersListVerified => '認証済み';

  @override
  String get membersListUnverified => '未認証';

  @override
  String get membersListYou => 'あなた';

  @override
  String get membersListActionEdit => '編集';

  @override
  String get membersListActionManageTeams => 'チーム管理';

  @override
  String get membersListEditTitle => 'ユーザーを編集';

  @override
  String get membersListEditDesc => '表示名とシステム権限を更新します。';

  @override
  String get membersListEditNameLabel => '表示名';

  @override
  String get membersListEditNamePlaceholder => '表示名を入力';

  @override
  String get membersListEditRoleLabel => 'システム権限';

  @override
  String get membersListEditRoleAdmin => '管理者';

  @override
  String get membersListEditRoleUser => '顧客';

  @override
  String get membersListEditSubmit => '変更を保存';

  @override
  String get membersListEditError => '更新に失敗しました。もう一度お試しください。';

  @override
  String membersListTeamsTitle(Object name) {
    return '$name のチーム';
  }

  @override
  String get membersListTeamsDesc => 'ユーザーをチームに追加・削除します。';

  @override
  String get membersListTeamsLoading => 'チームを読み込み中…';

  @override
  String get membersListTeamsEmpty => 'このユーザーはどのチームにも所属していません。';

  @override
  String get membersListTeamsOwnerBadge => 'オーナー';

  @override
  String get membersListTeamsRoleAdmin => '管理者';

  @override
  String get membersListTeamsRoleMember => 'メンバー';

  @override
  String get membersListTeamsRemove => 'チームから外す';

  @override
  String get membersListTeamsRemoveError => 'チームからの削除に失敗しました。もう一度お試しください。';

  @override
  String get membersListTeamsRemoving => '削除中…';

  @override
  String get membersListTeamsAddTitle => 'チームに追加';

  @override
  String get membersListTeamsSelectTeamLabel => 'チームを選択';

  @override
  String get membersListTeamsSelectTeamPlaceholder => '— チームを選択 —';

  @override
  String get membersListTeamsSearchPlaceholder => 'チームを検索…';

  @override
  String get membersListTeamsNoTeams => '一致するチームがありません。';

  @override
  String get membersListTeamsAddRoleLabel => 'チーム内の権限';

  @override
  String get membersListTeamsAddRoleMember => 'メンバー';

  @override
  String get membersListTeamsAddRoleAdmin => '管理者';

  @override
  String get membersListTeamsAddSubmit => 'チームに追加';

  @override
  String get membersListTeamsAdding => '追加中…';

  @override
  String get membersListTeamsAddError => 'チームへの追加に失敗しました。もう一度お試しください。';

  @override
  String get teamDetailLoading => 'チームを読み込み中…';

  @override
  String teamDetailError(Object message) {
    return '読み込みに失敗しました：$message';
  }

  @override
  String get teamDetailNotFound => 'チームが見つかりません。';

  @override
  String get teamDetailVisibilityPrivate => '非公開';

  @override
  String get teamDetailVisibilityPublic => '公開';

  @override
  String get teamDetailMembersTitle => 'メンバー';

  @override
  String teamDetailMembersCount(Object count) {
    return '$count 人のメンバー';
  }

  @override
  String get teamDetailRoleOwner => 'オーナー';

  @override
  String get teamDetailRoleAdmin => '管理者';

  @override
  String get teamDetailRoleMember => 'メンバー';

  @override
  String get teamDetailYou => 'あなた';

  @override
  String get teamDetailMakeAdmin => '管理者にする';

  @override
  String get teamDetailMakeMember => 'メンバーにする';

  @override
  String get teamDetailRemoveMember => '削除';

  @override
  String get teamDetailRemoveConfirm => 'このメンバーをチームから削除しますか？';

  @override
  String get teamDetailLeaveTeam => 'チームを離れる';

  @override
  String get teamDetailLeaveConfirm => '本当にこのチームを離れますか？';

  @override
  String get teamDetailInviteTitle => 'メンバーを追加・招待';

  @override
  String get teamDetailInvitePlaceholder => 'メールアドレスを入力してEnterを押す';

  @override
  String get teamDetailInviteHint => '招待はメールで送信されます。追加したメールは下の保留中リストに表示されます。';

  @override
  String get teamDetailInviteSubmit => '招待を送信';

  @override
  String get teamDetailInviteSending => '送信中…';

  @override
  String get teamDetailInviteInvalid => 'メールアドレスが正しくありません。';

  @override
  String get teamDetailInviteError => '招待の送信に失敗しました。もう一度お試しください。';

  @override
  String get teamDetailPendingTitle => '保留中の招待';

  @override
  String get teamDetailPendingEmpty => '保留中の招待はありません。';

  @override
  String get teamDetailStatusPending => '保留中';

  @override
  String get teamDetailCancelInvite => 'キャンセル';

  @override
  String get teamDetailProjectsTitle => 'プロジェクト';

  @override
  String get teamDetailProjectsEmpty => 'このチームにはまだプロジェクトがありません。';

  @override
  String get teamDetailAddProject => 'プロジェクトを追加';

  @override
  String get teamDetailRemoveProject => '削除';

  @override
  String get teamDetailRemoveProjectConfirm => 'このプロジェクトをチームから外しますか？';

  @override
  String get teamDetailAddProjectTitle => 'チームにプロジェクトを追加';

  @override
  String get teamDetailAddProjectDesc => 'このチームに追加するプロジェクトを選択してください。';

  @override
  String get teamDetailAddProjectEmpty => '追加できるプロジェクトがありません。';

  @override
  String get teamDetailAddProjectSubmit => '追加';

  @override
  String get teamDetailAddingProject => '追加中…';

  @override
  String get teamDetailAddProjectError => 'プロジェクトの追加に失敗しました。もう一度お試しください。';

  @override
  String get invitePageTitle => 'チームへの招待';

  @override
  String get invitePageDescription => 'チームに招待されています。承諾してメンバーになりましょう。';

  @override
  String get invitePageMissingToken => '招待リンクが無効か、情報が不足しています。';

  @override
  String get invitePageSignInRequired => 'この招待を承諾するにはサインインしてください。';

  @override
  String get invitePageSignInButton => 'サインイン';

  @override
  String get invitePageAccept => '招待を承諾';

  @override
  String get invitePageAccepting => '処理中…';

  @override
  String get invitePageSuccessTitle => 'チームに参加しました！';

  @override
  String get invitePageSuccessDesc => 'あなたはこのチームのメンバーになりました。';

  @override
  String get invitePageGoToTeam => 'チームページへ';

  @override
  String get invitePageErrorTitle => '招待を承諾できませんでした';

  @override
  String get invitePageBackToTeams => 'チーム一覧へ戻る';

  @override
  String get tasksTitle => 'タスク管理';

  @override
  String get tasksCreateNew => '新規タスク';

  @override
  String get tasksCreateShort => 'タスク作成';

  @override
  String get tasksFilterAll => 'すべて';

  @override
  String get tasksSearchPlaceholder => '名前、タグ、担当者でタスクを検索…';

  @override
  String get tasksLoading => '読み込み中…';

  @override
  String tasksErrorPrefix(Object message) {
    return 'エラー：$message';
  }

  @override
  String get tasksEmptyTitle => 'タスクがありません';

  @override
  String get tasksEmptyHelp => '最初のタスクを作成して業務管理を始めましょう。';

  @override
  String get tasksEmptyHelpSearch => '別のキーワードを試すかフィルタを解除してください。';

  @override
  String get tasksStatusPending => '未着手';

  @override
  String get tasksStatusInProgress => '進行中';

  @override
  String get tasksStatusCompleted => '完了';

  @override
  String tasksPriorityLabel(Object value) {
    return '優先度：$value';
  }

  @override
  String get tasksPriorityLow => '低';

  @override
  String get tasksPriorityMedium => '中';

  @override
  String get tasksPriorityHigh => '高';

  @override
  String get taskDialogCreateTitle => '新規タスク';

  @override
  String get taskDialogEditTitle => 'タスクを編集';

  @override
  String get taskDialogDescription => 'タスクの詳細を入力してください。';

  @override
  String get taskDialogNoLabel => '番号';

  @override
  String get taskDialogNoPlaceholder => '例：6';

  @override
  String get taskDialogNoRequired => '番号は必須です。';

  @override
  String get taskDialogNoInvalid => '番号は正の整数で入力してください。';

  @override
  String get taskDialogNoMustGtZero => '番号は1以上で入力してください。';

  @override
  String taskDialogNoDuplicate(Object value) {
    return '番号 #$value はこのプロジェクトに既に存在します。';
  }

  @override
  String taskDialogNoHint(Object value) {
    return 'おすすめ：#$value';
  }

  @override
  String get taskDialogTitleLabel => 'タイトル';

  @override
  String get taskDialogTitlePlaceholder => '例：週次レポートの完了';

  @override
  String get taskDialogTitleRequired => 'タイトルは必須です。';

  @override
  String get taskDialogDescriptionLabel => '説明';

  @override
  String get taskDialogDescriptionPlaceholder => '作業内容、メモなど…';

  @override
  String get taskDialogStatusLabel => 'ステータス';

  @override
  String get taskDialogPriorityLabel => '優先度';

  @override
  String get taskDialogStartDateLabel => '開始日';

  @override
  String get taskDialogDueDateLabel => '期限';

  @override
  String get taskDialogAssigneeLabel => '担当者';

  @override
  String get taskDialogAssigneePlaceholder => '例：田中';

  @override
  String get taskDialogTagsLabel => 'タグ（カンマ区切り）';

  @override
  String get taskDialogTagsPlaceholder => 'backend, urgent';

  @override
  String get taskDialogThumbnailLabel => 'サムネイル（任意）';

  @override
  String get taskDialogSubmitCreate => 'タスクを作成';

  @override
  String get taskDialogSubmitEdit => '変更を保存';

  @override
  String taskItemAriaNumber(Object value) {
    return 'タスク番号 $value';
  }

  @override
  String taskItemAriaComments(Object count) {
    return '$count 件のコメント';
  }

  @override
  String get taskItemAriaEdit => 'タスクを編集';

  @override
  String get taskItemAriaDelete => 'タスクを削除';

  @override
  String get taskDetailBack => '戻る';

  @override
  String get taskDetailEdit => '編集';

  @override
  String get taskDetailDelete => '削除';

  @override
  String get taskDetailAssignee => '担当者：';

  @override
  String get taskDetailStartDate => '開始：';

  @override
  String get taskDetailDueDate => '期限：';

  @override
  String get taskDetailOverdue => '期限超過';

  @override
  String get taskDetailTags => 'タグ：';

  @override
  String get taskDetailDescriptionHeading => '説明';

  @override
  String get taskDetailNoDescription => '説明はまだありません。';

  @override
  String taskDetailPriorityWithLabel(Object value) {
    return '優先度：$value';
  }

  @override
  String get taskDetailDeleteConfirm => 'このタスクを削除しますか？';

  @override
  String get commentsTitle => 'コメント';

  @override
  String get commentsYourComment => 'あなたのコメント';

  @override
  String get commentsPlaceholder => 'コメントを入力…';

  @override
  String get commentsAttach => '添付';

  @override
  String get commentsAttachOnlyFallback => '（添付ファイル）';

  @override
  String get commentsUserFallback => 'ユーザー';

  @override
  String commentsRemoveFile(Object name) {
    return '$name を削除';
  }

  @override
  String commentsMaxPerComment(Object count) {
    return 'コメントごとに最大 $count ファイルまで添付できます。';
  }

  @override
  String get commentsLoading => 'コメントを読み込み中…';

  @override
  String get commentsEmpty => 'コメントはまだありません。最初のコメントを投稿しましょう！';

  @override
  String get commentsReply => '返信';

  @override
  String get commentsEdit => '編集';

  @override
  String get commentsDelete => '削除';

  @override
  String get commentsDeleteConfirm => 'このコメントを削除しますか？';

  @override
  String get commentsSend => 'コメントを送信';

  @override
  String get commentsSending => '送信中…';

  @override
  String get commentsSendReply => '返信を送信';

  @override
  String commentsReplyingTo(Object name) {
    return '@$name さんへ返信';
  }

  @override
  String commentsReplyPlaceholder(Object name) {
    return '@$name さんへ返信…';
  }

  @override
  String get commentsCancel => 'キャンセル';

  @override
  String get commentsSave => '保存';

  @override
  String get commentsEdited => '（編集済み）';

  @override
  String get commentsOpenPdfTitle => 'PDF を新しいタブで開く';

  @override
  String commentsDownloadTitle(Object name, Object size) {
    return 'ダウンロード：$name（$size）';
  }

  @override
  String attachmentsErrorEmpty(Object name) {
    return 'ファイル「$name」は空です。';
  }

  @override
  String attachmentsErrorTooLarge(Object name, Object limit) {
    return 'ファイル「$name」は上限 ${limit}MB を超えています。';
  }

  @override
  String attachmentsErrorBlocked(Object ext) {
    return '.$ext 形式は許可されていません。';
  }

  @override
  String attachmentsErrorUnsupported(Object ext) {
    return '.$ext 形式はサポートされていません。';
  }

  @override
  String attachmentsErrorBadMime(Object mime, Object name) {
    return 'ファイル「$name」の MIME「$mime」はサポートされていません。';
  }

  @override
  String get fileInputPickImage => '画像を選択';

  @override
  String get fileInputChangeImage => '画像を変更';

  @override
  String get fileInputClear => 'クリア';

  @override
  String get fileInputHelper => 'JPG / PNG / WEBP / GIF、最大 5MB';

  @override
  String get fileInputErrorInvalidType => 'JPG / PNG / WEBP / GIF のみ対応しています。';

  @override
  String get fileInputErrorTooLarge => 'ファイルが大きすぎます（最大 5MB）。';

  @override
  String get imageLightboxClose => '閉じる';

  @override
  String get settingsTitle => '設定';

  @override
  String get settingsSubtitle => '外観と表示言語を管理します。';

  @override
  String get settingsSectionAppearance => '外観';

  @override
  String get settingsTheme => 'テーマ';

  @override
  String get settingsThemeLight => 'ライト';

  @override
  String get settingsThemeDark => 'ダーク';

  @override
  String get settingsThemeSystem => 'システム';

  @override
  String get settingsSectionLanguage => '言語';

  @override
  String get settingsLanguage => '表示言語';

  @override
  String get settingsLanguageHelp => 'インターフェース全体で使用する言語を選択してください。';

  @override
  String get languagesEn => 'English';

  @override
  String get languagesVi => 'Tiếng Việt';

  @override
  String get languagesJa => '日本語';

  @override
  String get breadcrumbsDashboard => 'ダッシュボード';

  @override
  String get breadcrumbsProjectFallback => 'プロジェクト';

  @override
  String get breadcrumbsTaskFallback => 'タスク';

  @override
  String get breadcrumbsTask => 'タスク';

  @override
  String get breadcrumbsSettings => '設定';

  @override
  String get pagesTaskLoading => 'タスクを読み込み中…';

  @override
  String get pagesTaskErrorFallback => 'タスクを読み込めませんでした。';

  @override
  String get taskImagesLabel => '画像';

  @override
  String get taskImagesHint => 'ドラッグで並べ替え・先頭の画像がカバー画像';

  @override
  String get taskImagesCover => 'カバー';

  @override
  String get taskImagesSetCover => 'カバー画像に設定';

  @override
  String get taskImagesRemove => '画像を削除';

  @override
  String get taskImagesAdd => '画像を追加';

  @override
  String get taskImagesAddHint => 'ドロップまたはクリック';

  @override
  String taskImagesLimitReached(Object count) {
    return '上限の$count枚に達しました';
  }

  @override
  String taskImagesTooLarge(Object name) {
    return '$name: 5MBを超えています';
  }

  @override
  String taskImagesBadType(Object name) {
    return '$name: 非対応の形式です（JPG/PNG/WEBP/GIF）';
  }

  @override
  String taskImagesTooMany(Object count) {
    return '追加できるのはあと$count枚までです';
  }

  @override
  String taskImagesUploading(Object done, Object total) {
    return '画像をアップロード中 $done/$total…';
  }

  @override
  String taskImagesUploadFailed(Object count) {
    return '$count枚の画像のアップロードに失敗しました。タスクは保存済みです。後で追加し直してください。';
  }

  @override
  String get taskImagesClose => '閉じる';

  @override
  String get taskImagesPrev => '前の画像';

  @override
  String get taskImagesNext => '次の画像';

  @override
  String get taskImagesOpenFull => '全画面表示';

  @override
  String taskImagesImageCount(Object count) {
    return '$count枚';
  }

  @override
  String get mobileNotificationsSubtitle => 'プロジェクト内のタスクに関する最新情報です。';

  @override
  String get mobileNotificationsAssigned => 'あなたに割り当て';

  @override
  String get mobileNotificationsEmpty => '新しい通知はありません。';

  @override
  String get mobileConfigMissingTitle => 'Firebase の設定がありません';

  @override
  String get mobileConfigMissingDesc =>
      '--dart-define-from-file=config/firebase.json を付けてアプリを実行してください（mobile/README.md 参照）。';

  @override
  String get mobileOpenFile => 'ファイルを開く';

  @override
  String get mobilePickFromGallery => 'ライブラリから選択';

  @override
  String get mobileTakePhoto => '写真を撮る';

  @override
  String get mobilePickFiles => 'ファイルを選択';

  @override
  String get mobileProfileTitle => 'アカウント';

  @override
  String get mobileNavOverviewTab => '概要';

  @override
  String get mobileAppBarBrand => 'Task Manager';

  @override
  String get accessRoleAdmin => '管理者';

  @override
  String get accessRoleCustomer => '顧客';

  @override
  String get accessNoPermissionTitle => 'このページへのアクセス権がありません';

  @override
  String get accessNoPermissionDesc =>
      'このページは管理者専用です。アクセスが必要な場合は管理者にお問い合わせください。';

  @override
  String get accessBackToDashboard => 'ダッシュボードへ戻る';

  @override
  String get accessDeniedLogin => 'アカウントにアクセス権が付与されていないか、ロックされています。';

  @override
  String get accessContactAdmin => '管理者にお問い合わせください。';

  @override
  String get accessCreateAccount => 'アカウント作成';

  @override
  String get accessCreateTitle => '新しいアカウントを作成';

  @override
  String get accessCreateDesc => 'パスワード設定用リンクを記載したメールがユーザーに送信されます。';

  @override
  String get accessEmailLabel => 'メールアドレス';

  @override
  String get accessEmailPlaceholder => 'customer@company.co.jp';

  @override
  String get accessNameLabel => '表示名';

  @override
  String get accessNamePlaceholder => '例: 山田 太郎';

  @override
  String get accessRoleLabel => 'ロール';

  @override
  String get accessRoleCustomerHint => '割り当てられたプロジェクトのみ閲覧';

  @override
  String get accessRoleAdminHint => 'システム全体の権限';

  @override
  String get accessProjectsLabel => 'アクセスできるプロジェクト';

  @override
  String get accessProjectsHint => '顧客はここで選択したプロジェクトのみ閲覧できます。';

  @override
  String get accessNoProjectsAvailable => 'プロジェクトがありません。';

  @override
  String get accessCreating => '作成中…';

  @override
  String get accessCreateSubmit => 'アカウント作成';

  @override
  String get accessCreateError => 'アカウントを作成できませんでした。';

  @override
  String get accessCreatedTitle => 'アカウントを作成しました';

  @override
  String accessCreatedEmailSent(Object email) {
    return '$email にパスワード設定メールを送信しました。';
  }

  @override
  String accessCreatedEmailFailed(Object email) {
    return '$email にメールを送信できませんでした。下のリンクをコピーしてユーザーに送ってください。';
  }

  @override
  String get accessSetPasswordLink => 'パスワード設定リンク';

  @override
  String get accessCopy => 'コピー';

  @override
  String get accessCopied => 'コピーしました';

  @override
  String get accessDone => '完了';

  @override
  String get accessActionProjects => 'プロジェクト';

  @override
  String get accessActionLock => 'ロック';

  @override
  String get accessActionUnlock => 'ロック解除';

  @override
  String get accessActionResendLink => 'リンク再送';

  @override
  String accessLockConfirm(Object email) {
    return '$email のアカウントをロックしますか？ロック解除までログインできなくなります。';
  }

  @override
  String accessUnlockConfirm(Object email) {
    return '$email のアカウントのロックを解除しますか？';
  }

  @override
  String get accessStatusDisabled => 'ロック中';

  @override
  String accessProjectCountLabel(Object count) {
    return '$count 件のプロジェクト';
  }

  @override
  String get accessResendTitle => '新しいパスワード設定リンク';

  @override
  String get accessResendError => 'パスワード設定リンクを作成できませんでした。';

  @override
  String accessUserProjectsTitle(Object name) {
    return '$name のプロジェクト';
  }

  @override
  String get accessUserProjectsDesc => 'このユーザーがアクセスできるプロジェクトを選択してください。';

  @override
  String get accessSearchProjects => 'プロジェクトを検索…';

  @override
  String get accessSaveProjects => '保存';

  @override
  String get accessSaveError => '保存できませんでした。';

  @override
  String accessSelectedCount(Object count) {
    return '$count 件選択中';
  }

  @override
  String get accessProjectMembers => 'プロジェクトメンバー';

  @override
  String accessProjectMembersCount(Object count) {
    return '$count 人';
  }

  @override
  String get accessManageMembers => '管理';

  @override
  String get accessMembersDialogTitle => 'プロジェクトメンバー';

  @override
  String get accessMembersDialogDesc => '割り当てられたメンバーのみがこのプロジェクトを閲覧・作業できます。';

  @override
  String get accessAddMemberTitle => 'メンバーを追加';

  @override
  String get accessSearchUsers => '名前またはメールで検索…';

  @override
  String get accessNoMembers => 'メンバーがいません。';

  @override
  String get accessNoCandidates => '該当するユーザーがいません。';

  @override
  String get accessRemoveMember => 'プロジェクトから外す';

  @override
  String get accessMemberError => '操作に失敗しました。';

  @override
  String get accessAssigneeNone => '— 未割り当て —';

  @override
  String get accessColUser => 'ユーザー';

  @override
  String get accessColRole => 'ロール';

  @override
  String get accessColStatus => 'ステータス';

  @override
  String get accessColAccess => 'アクセス';

  @override
  String get accessColCreated => '作成日';

  @override
  String get accessColActions => '操作';

  @override
  String get accessStatusActive => '有効';

  @override
  String get accessMoreActions => 'その他の操作';

  @override
  String get dashboardTitle => 'ダッシュボード';

  @override
  String get dashboardSubtitle => 'プロジェクトとタスクの全体像を把握できます。';

  @override
  String get dashboardStatTotalProjects => '総プロジェクト数';

  @override
  String get dashboardStatTotalTasks => '総タスク数';

  @override
  String get dashboardStatInProgress => '進行中';

  @override
  String get dashboardStatCompleted => '完了';

  @override
  String dashboardStatCompletionPct(Object value) {
    return '完了率 $value%';
  }

  @override
  String get dashboardSectionOverdue => '期限超過';

  @override
  String get dashboardSectionUpcoming => 'もうすぐ期限';

  @override
  String dashboardUpcomingWindow(Object days) {
    return '今後 $days 日間';
  }

  @override
  String get dashboardSectionRecent => '最近のアクティビティ';

  @override
  String get dashboardSectionActiveProjects => 'アクティブなプロジェクト';

  @override
  String get dashboardViewAll => 'すべて表示';

  @override
  String get dashboardEmptyOverdue => '期限超過のタスクはありません。素晴らしい！';

  @override
  String get dashboardEmptyUpcoming => '今週中に期限を迎えるタスクはありません。';

  @override
  String get dashboardEmptyRecent => '最近のアクティビティはまだありません。';

  @override
  String get dashboardEmptyProjects => 'プロジェクトはまだありません。';

  @override
  String get dashboardEmptyProjectsCta => '最初のプロジェクトを作成';

  @override
  String get dashboardDueToday => '本日が期限';

  @override
  String get dashboardDueTomorrow => '明日が期限';

  @override
  String dashboardDueInDays(Object days) {
    return 'あと $days 日';
  }

  @override
  String dashboardOverdueByDays(Object days) {
    return '$days 日超過';
  }

  @override
  String get dashboardLoading => '読み込み中…';

  @override
  String dashboardError(Object message) {
    return 'エラー：$message';
  }

  @override
  String get dashboardSectionStatusDistribution => 'ステータス分布';

  @override
  String get dashboardSectionTopProjects => 'タスク数上位プロジェクト';

  @override
  String get dashboardSectionPriorityBreakdown => '優先度の内訳';

  @override
  String get dashboardChartTasksLabel => 'タスク';

  @override
  String get dashboardChartNoData => 'グラフを表示するデータが不足しています。';

  @override
  String get dashboardChartTotalLabel => '合計';
}
