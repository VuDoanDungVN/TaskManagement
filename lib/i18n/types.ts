/**
 * Shape của 1 dictionary i18n. Tất cả locales phải implement đầy đủ shape này
 * để TypeScript bắt thiếu key.
 *
 * Mở rộng locale mới: tạo file `dictionaries/<code>.ts` export object kiểu
 * `Dictionary`, rồi đăng ký trong `dictionaries/index.ts`.
 */
export interface Dictionary {
  common: {
    save: string
    cancel: string
    edit: string
    delete: string
    saving: string
    sending: string
    deleting: string
    loading: string
    error: string
    back: string
    search: string
    optional: string
    close: string
    retry: string
  }
  nav: {
    appName: string
    sectionOverview: string
    dashboard: string
    analytics: string
    organization: string
    projects: string
    sectionFinance: string
    transactions: string
    invoices: string
    payments: string
    sectionTeam: string
    createTeam: string
    teamList: string
    members: string
    permissions: string
    chat: string
    meetings: string
    settings: string
    help: string
  }
  topnav: {
    openSidebar: string
    closeSidebar: string
    breadcrumb: string
    openUserMenu: string
    signIn: string
    themeLight: string
    themeDark: string
    themeSystem: string
    language: string
  }
  auth: {
    login: {
      title: string
      subtitle: string
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      forgotPassword: string
      showPassword: string
      hidePassword: string
      submit: string
      submitting: string
      noAccount: string
      register: string
      firebaseNotConfigured: string
      forgotEmailPrompt: string
      resetEmailSent: string
    }
    register: {
      title: string
      subtitle: string
      fullNameLabel: string
      fullNamePlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      confirmLabel: string
      confirmPlaceholder: string
      submit: string
      submitting: string
      disclaimer: string
      haveAccount: string
      login: string
      errors: {
        fullNameRequired: string
        emailRequired: string
        passwordMinLength: string
        confirmMismatch: string
        firebaseNotConfigured: string
      }
    }
    verify: {
      title: string
      subtitle: string
      instruction: string
      checking: string
      iVerified: string
      resendCountdown: string
      resend: string
      signOutAndSwitch: string
      success: string
      stillNotVerified: string
      resent: string
    }
  }
  profile: {
    statusActive: string
    statusAway: string
    statusOffline: string
    sectionAccount: string
    profile: string
    settings: string
    notifications: string
    sectionSupport: string
    help: string
    terms: string
    changeAvatar: string
    signOut: string
    signingOut: string
    uploadFailed: string
  }
  projects: {
    guestBannerTitle: string
    guestBannerDesc: string
    title: string
    countLabel: string
    createNew: string
    signInToViewTitle: string
    signInToViewHelp: string
    loading: string
    error: string
    emptyTitle: string
    emptyHelp: string
    card: {
      tasksTotal: string
      pendingShort: string
      inProgressShort: string
      doneShort: string
      progress: string
      viewDetail: string
    }
  }
  projectDialog: {
    createTitle: string
    createDesc: string
    nameLabel: string
    namePlaceholder: string
    nameRequired: string
    descriptionLabel: string
    descriptionPlaceholder: string
    thumbnailLabel: string
    submit: string
  }
  teamDialog: {
    createTitle: string
    createDesc: string
    nameLabel: string
    namePlaceholder: string
    nameRequired: string
    descriptionLabel: string
    descriptionPlaceholder: string
    avatarLabel: string
    visibilityLabel: string
    visibilityPrivate: string
    visibilityPrivateHint: string
    visibilityPublic: string
    visibilityPublicHint: string
    inviteLabel: string
    invitePlaceholder: string
    inviteHint: string
    inviteInvalid: string
    submit: string
    creating: string
    createError: string
  }
  teamsList: {
    title: string
    countLabel: string
    loading: string
    error: string
    emptyTitle: string
    emptyHelp: string
    loadMore: string
    loadingMore: string
    endOfList: string
    card: {
      membersCount: string
      visibilityPrivate: string
      visibilityPublic: string
      roleOwner: string
      roleAdmin: string
      roleMember: string
    }
    deleteAria: string
    deleteTitle: string
    deleteMessage: string
    deleteConfirmWord: string
    deleteConfirmPrompt: string
    deletePlaceholder: string
    deleteSubmit: string
    deleting: string
    deleteError: string
  }
  membersList: {
    title: string
    subtitle: string
    countLabel: string
    searchPlaceholder: string
    loading: string
    error: string
    emptyTitle: string
    emptyHelp: string
    emptyHelpSearch: string
    loadMore: string
    loadingMore: string
    endOfList: string
    roleAdmin: string
    roleUser: string
    teamCountLabel: string
    verified: string
    unverified: string
    you: string
    actionEdit: string
    actionManageTeams: string
    edit: {
      title: string
      desc: string
      nameLabel: string
      namePlaceholder: string
      roleLabel: string
      roleAdmin: string
      roleUser: string
      submit: string
      error: string
    }
    teams: {
      title: string
      desc: string
      loading: string
      empty: string
      ownerBadge: string
      roleAdmin: string
      roleMember: string
      remove: string
      removeError: string
      removing: string
      addTitle: string
      selectTeamLabel: string
      selectTeamPlaceholder: string
      searchPlaceholder: string
      noTeams: string
      addRoleLabel: string
      addRoleMember: string
      addRoleAdmin: string
      addSubmit: string
      adding: string
      addError: string
    }
  }
  teamDetail: {
    loading: string
    error: string
    notFound: string
    visibilityPrivate: string
    visibilityPublic: string
    membersTitle: string
    membersCount: string
    roleOwner: string
    roleAdmin: string
    roleMember: string
    you: string
    makeAdmin: string
    makeMember: string
    removeMember: string
    removeConfirm: string
    leaveTeam: string
    leaveConfirm: string
    inviteTitle: string
    invitePlaceholder: string
    inviteHint: string
    inviteSubmit: string
    inviteSending: string
    inviteInvalid: string
    inviteError: string
    pendingTitle: string
    pendingEmpty: string
    statusPending: string
    cancelInvite: string
    projectsTitle: string
    projectsEmpty: string
    addProject: string
    removeProject: string
    removeProjectConfirm: string
    addProjectTitle: string
    addProjectDesc: string
    addProjectEmpty: string
    addProjectSubmit: string
    addingProject: string
    addProjectError: string
  }
  invitePage: {
    title: string
    description: string
    missingToken: string
    signInRequired: string
    signInButton: string
    accept: string
    accepting: string
    successTitle: string
    successDesc: string
    goToTeam: string
    errorTitle: string
    backToTeams: string
  }
  tasks: {
    title: string
    createNew: string
    createShort: string
    filterAll: string
    searchPlaceholder: string
    loading: string
    errorPrefix: string
    emptyTitle: string
    emptyHelp: string
    emptyHelpSearch: string
    status: {
      pending: string
      inProgress: string
      completed: string
    }
    priority: {
      label: string
      low: string
      medium: string
      high: string
    }
  }
  taskDialog: {
    createTitle: string
    editTitle: string
    description: string
    noLabel: string
    noPlaceholder: string
    noRequired: string
    noInvalid: string
    noMustGtZero: string
    noDuplicate: string
    noHint: string
    titleLabel: string
    titlePlaceholder: string
    titleRequired: string
    descriptionLabel: string
    descriptionPlaceholder: string
    statusLabel: string
    priorityLabel: string
    startDateLabel: string
    dueDateLabel: string
    assigneeLabel: string
    assigneePlaceholder: string
    tagsLabel: string
    tagsPlaceholder: string
    thumbnailLabel: string
    submitCreate: string
    submitEdit: string
  }
  taskItem: {
    ariaNumber: string
    ariaComments: string
    ariaEdit: string
    ariaDelete: string
  }
  taskDetail: {
    back: string
    edit: string
    delete: string
    assignee: string
    startDate: string
    dueDate: string
    overdue: string
    tags: string
    descriptionHeading: string
    noDescription: string
    priorityWithLabel: string
    deleteConfirm: string
  }
  comments: {
    title: string
    yourComment: string
    placeholder: string
    attach: string
    attachOnlyFallback: string
    userFallback: string
    removeFile: string
    maxPerComment: string
    loading: string
    empty: string
    reply: string
    edit: string
    delete: string
    deleteConfirm: string
    send: string
    sending: string
    sendReply: string
    replyingTo: string
    replyPlaceholder: string
    cancel: string
    save: string
    edited: string
    openPdfTitle: string
    downloadTitle: string
  }
  attachments: {
    errorEmpty: string
    errorTooLarge: string
    errorBlocked: string
    errorUnsupported: string
    errorBadMime: string
  }
  fileInput: {
    pickImage: string
    changeImage: string
    clear: string
    helper: string
    errorInvalidType: string
    errorTooLarge: string
  }
  imageLightbox: {
    close: string
  }
  settings: {
    title: string
    subtitle: string
    sectionAppearance: string
    theme: string
    themeLight: string
    themeDark: string
    themeSystem: string
    sectionLanguage: string
    language: string
    languageHelp: string
  }
  languages: {
    en: string
    vi: string
    ja: string
  }
  breadcrumbs: {
    dashboard: string
    projectFallback: string
    taskFallback: string
    task: string
    settings: string
  }
  pages: {
    task: {
      loading: string
      errorFallback: string
    }
  }
  taskImages: {
    label: string
    hint: string
    cover: string
    setCover: string
    remove: string
    add: string
    addHint: string
    limitReached: string
    tooLarge: string
    badType: string
    tooMany: string
    uploading: string
    uploadFailed: string
    close: string
    prev: string
    next: string
    openFull: string
    imageCount: string
  }
  /** Chuỗi chỉ app Flutter (mobile/) dùng — sinh sang ARB bằng mobile/tool/gen_arb.mjs */
  mobile: {
    notificationsSubtitle: string
    notificationsAssigned: string
    notificationsEmpty: string
    configMissingTitle: string
    configMissingDesc: string
    openFile: string
    pickFromGallery: string
    takePhoto: string
    pickFiles: string
    profileTitle: string
  }
  access: {
    roleAdmin: string
    roleCustomer: string
    noPermissionTitle: string
    noPermissionDesc: string
    backToDashboard: string
    deniedLogin: string
    contactAdmin: string
    createAccount: string
    createTitle: string
    createDesc: string
    emailLabel: string
    emailPlaceholder: string
    nameLabel: string
    namePlaceholder: string
    roleLabel: string
    roleCustomerHint: string
    roleAdminHint: string
    projectsLabel: string
    projectsHint: string
    noProjectsAvailable: string
    creating: string
    createSubmit: string
    createError: string
    createdTitle: string
    createdEmailSent: string
    createdEmailFailed: string
    setPasswordLink: string
    copy: string
    copied: string
    done: string
    actionProjects: string
    actionLock: string
    actionUnlock: string
    actionResendLink: string
    lockConfirm: string
    unlockConfirm: string
    statusDisabled: string
    projectCountLabel: string
    resendTitle: string
    resendError: string
    userProjectsTitle: string
    userProjectsDesc: string
    searchProjects: string
    saveProjects: string
    saveError: string
    selectedCount: string
    projectMembers: string
    projectMembersCount: string
    manageMembers: string
    membersDialogTitle: string
    membersDialogDesc: string
    addMemberTitle: string
    searchUsers: string
    noMembers: string
    noCandidates: string
    removeMember: string
    memberError: string
    assigneeNone: string
    colUser: string
    colRole: string
    colStatus: string
    colAccess: string
    colCreated: string
    colActions: string
    statusActive: string
    moreActions: string
  }
  dashboard: {
    title: string
    subtitle: string
    statTotalProjects: string
    statTotalTasks: string
    statInProgress: string
    statCompleted: string
    statCompletionPct: string
    sectionOverdue: string
    sectionUpcoming: string
    upcomingWindow: string
    sectionRecent: string
    sectionActiveProjects: string
    viewAll: string
    emptyOverdue: string
    emptyUpcoming: string
    emptyRecent: string
    emptyProjects: string
    emptyProjectsCta: string
    dueToday: string
    dueTomorrow: string
    dueInDays: string
    overdueByDays: string
    loading: string
    error: string
    sectionStatusDistribution: string
    sectionTopProjects: string
    sectionPriorityBreakdown: string
    chartTasksLabel: string
    chartNoData: string
    chartTotalLabel: string
  }
}

export type LocaleCode = "en" | "vi" | "ja"

export interface LocaleMeta {
  code: LocaleCode
  /** Tên hiển thị bản ngữ (vd: "English", "Tiếng Việt", "日本語") */
  nativeName: string
}

/**
 * Path-string vào sâu trong Dictionary, vd "common.save", "auth.login.title".
 * Cho IDE autocomplete + bắt typo lúc compile.
 */
export type TranslationKey = DotNestedKeys<Dictionary>

// Helper compute deep key paths
type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in keyof T & (string | number)]: T[K] extends object
          ? `${K}` | `${K}.${DotNestedKeys<T[K]>}`
          : `${K}`
      }[keyof T & (string | number)]
    : never
) extends infer D
  ? Extract<D, string>
  : never
