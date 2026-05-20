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
  tasks: {
    title: string
    createNew: string
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
