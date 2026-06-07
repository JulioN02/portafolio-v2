"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  Checkbox: () => Checkbox,
  ErrorBoundary: () => ErrorBoundary,
  ErrorFallback: () => ErrorFallback,
  ErrorMessage: () => ErrorMessage,
  Input: () => Input,
  Loading: () => Loading,
  Modal: () => Modal,
  ProtectedRoute: () => ProtectedRoute,
  Select: () => Select,
  Textarea: () => Textarea,
  blogPostFilterSchema: () => blogPostFilterSchema,
  blogPostSchema: () => blogPostSchema,
  blogPostStatusSchema: () => blogPostStatusSchema,
  blogPostUpdateSchema: () => blogPostUpdateSchema,
  changePasswordSchema: () => changePasswordSchema,
  clientContactSchema: () => clientContactSchema,
  contactFormFilterSchema: () => contactFormFilterSchema,
  contactFormSchema: () => contactFormSchema,
  createApiClient: () => createApiClient,
  formOriginEnum: () => formOriginEnum,
  jwtPayloadSchema: () => jwtPayloadSchema,
  loginSchema: () => loginSchema,
  postStatusEnum: () => postStatusEnum,
  productFilterSchema: () => productFilterSchema,
  productSchema: () => productSchema,
  productStatusSchema: () => productStatusSchema,
  productUpdateSchema: () => productUpdateSchema,
  recruiterContactSchema: () => recruiterContactSchema,
  sendVerificationCodeSchema: () => sendVerificationCodeSchema,
  serviceFilterSchema: () => serviceFilterSchema,
  serviceSchema: () => serviceSchema,
  serviceStatusSchema: () => serviceStatusSchema,
  serviceUpdateSchema: () => serviceUpdateSchema,
  siteSectionReorderSchema: () => siteSectionReorderSchema,
  siteSectionSchema: () => siteSectionSchema,
  siteSectionUpdateSchema: () => siteSectionUpdateSchema,
  successCaseFilterSchema: () => successCaseFilterSchema,
  successCaseSchema: () => successCaseSchema,
  successCaseStatusSchema: () => successCaseStatusSchema,
  successCaseUpdateSchema: () => successCaseUpdateSchema,
  toolFilterSchema: () => toolFilterSchema,
  toolSchema: () => toolSchema,
  toolStatusSchema: () => toolStatusSchema,
  toolUpdateSchema: () => toolUpdateSchema,
  updateProfileSchema: () => updateProfileSchema,
  withBoundary: () => withBoundary
});
module.exports = __toCommonJS(index_exports);

// src/schemas/service.schema.ts
var import_zod2 = require("zod");

// src/schemas/blogPost.schema.ts
var import_zod = require("zod");
var postStatusEnum = import_zod.z.enum(["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]);
var blogPostSchema = import_zod.z.object({
  title: import_zod.z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: import_zod.z.string().min(3).max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  category: import_zod.z.string().min(2).max(50),
  shortDescription: import_zod.z.string().min(10).max(500),
  coverImage: import_zod.z.string().url(),
  mediaGallery: import_zod.z.array(import_zod.z.string().url()).optional(),
  body: import_zod.z.string().min(100, "Body must be at least 100 characters").max(5e4),
  externalLink: import_zod.z.string().url().optional(),
  lessonsLearned: import_zod.z.string().max(2e4).optional(),
  status: postStatusEnum.default("DRAFT")
});
var blogPostUpdateSchema = blogPostSchema.partial();
var blogPostFilterSchema = import_zod.z.object({
  status: postStatusEnum.optional(),
  category: import_zod.z.string().optional(),
  search: import_zod.z.string().optional(),
  page: import_zod.z.coerce.number().int().min(1).default(1),
  limit: import_zod.z.coerce.number().int().min(1).max(100).default(10)
});
var blogPostStatusSchema = import_zod.z.object({
  status: postStatusEnum
});

// src/schemas/service.schema.ts
var serviceSchema = import_zod2.z.object({
  title: import_zod2.z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: import_zod2.z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: import_zod2.z.string().min(2, "Classification must be at least 2 characters").max(50),
  shortDescription: import_zod2.z.string().min(10, "Short description must be at least 10 characters").max(300),
  fullDescription: import_zod2.z.string().min(50, "Full description must be at least 50 characters"),
  includedItems: import_zod2.z.array(import_zod2.z.string().min(3)).min(1, "At least one included item is required"),
  images: import_zod2.z.array(import_zod2.z.string().url()).min(1, "At least one image is required"),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: import_zod2.z.string().max(15e3).optional(),
  technicalImages: import_zod2.z.array(import_zod2.z.string().url()).optional()
});
var serviceUpdateSchema = serviceSchema.partial();
var serviceFilterSchema = import_zod2.z.object({
  status: postStatusEnum.optional(),
  classification: import_zod2.z.string().optional(),
  page: import_zod2.z.coerce.number().int().min(1).default(1),
  limit: import_zod2.z.coerce.number().int().min(1).max(100).default(10)
});
var serviceStatusSchema = import_zod2.z.object({
  status: postStatusEnum
});

// src/schemas/product.schema.ts
var import_zod3 = require("zod");
var productSchema = import_zod3.z.object({
  title: import_zod3.z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: import_zod3.z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: import_zod3.z.string().min(2).max(50),
  shortDescription: import_zod3.z.string().min(10).max(300),
  fullDescription: import_zod3.z.string().min(50),
  images: import_zod3.z.array(import_zod3.z.string().url()).min(1),
  externalLink: import_zod3.z.string().url().optional(),
  featured: import_zod3.z.boolean().default(false),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: import_zod3.z.string().max(15e3).optional(),
  technicalImages: import_zod3.z.array(import_zod3.z.string().url()).optional()
});
var productUpdateSchema = productSchema.partial();
var productFilterSchema = import_zod3.z.object({
  featured: import_zod3.z.coerce.boolean().optional(),
  status: postStatusEnum.optional(),
  classification: import_zod3.z.string().optional(),
  page: import_zod3.z.coerce.number().int().min(1).default(1),
  limit: import_zod3.z.coerce.number().int().min(1).max(100).default(10)
});
var productStatusSchema = import_zod3.z.object({
  status: postStatusEnum
});

// src/schemas/tool.schema.ts
var import_zod4 = require("zod");
var toolSchema = import_zod4.z.object({
  title: import_zod4.z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: import_zod4.z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: import_zod4.z.string().min(2).max(50),
  shortDescription: import_zod4.z.string().min(10).max(300),
  fullDescription: import_zod4.z.string().min(50),
  images: import_zod4.z.array(import_zod4.z.string().url()).min(1),
  requiresInstall: import_zod4.z.boolean().default(false),
  featured: import_zod4.z.boolean().default(false),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: import_zod4.z.string().max(15e3).optional(),
  technicalImages: import_zod4.z.array(import_zod4.z.string().url()).optional()
});
var toolUpdateSchema = toolSchema.partial();
var toolFilterSchema = import_zod4.z.object({
  featured: import_zod4.z.coerce.boolean().optional(),
  status: postStatusEnum.optional(),
  classification: import_zod4.z.string().optional(),
  page: import_zod4.z.coerce.number().int().min(1).default(1),
  limit: import_zod4.z.coerce.number().int().min(1).max(100).default(10)
});
var toolStatusSchema = import_zod4.z.object({
  status: postStatusEnum
});

// src/schemas/successCase.schema.ts
var import_zod5 = require("zod");
var successCaseSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(3, "Title must be at least 3 characters").max(100),
  slug: import_zod5.z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: import_zod5.z.string().min(10).max(1e3),
  images: import_zod5.z.array(import_zod5.z.string().url()).min(1),
  videos: import_zod5.z.array(import_zod5.z.string().url()).optional(),
  links: import_zod5.z.array(import_zod5.z.string().url()).optional(),
  status: postStatusEnum.default("DRAFT")
});
var successCaseUpdateSchema = successCaseSchema.partial();
var successCaseFilterSchema = import_zod5.z.object({
  status: postStatusEnum.optional(),
  classification: import_zod5.z.string().optional(),
  page: import_zod5.z.coerce.number().int().min(1).default(1),
  limit: import_zod5.z.coerce.number().int().min(1).max(100).default(10)
});
var successCaseStatusSchema = import_zod5.z.object({
  status: postStatusEnum
});

// src/schemas/contact.schema.ts
var import_zod6 = require("zod");
var formOriginEnum = import_zod6.z.enum(["CLIENT", "RECRUITER"]);
var clientContactSchema = import_zod6.z.object({
  firstName: import_zod6.z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: import_zod6.z.string().min(2).max(50).optional(),
  whatsapp: import_zod6.z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid WhatsApp number format").optional(),
  email: import_zod6.z.string().email("Invalid email format"),
  message: import_zod6.z.string().min(10, "Message must be at least 10 characters").max(2e3),
  source: import_zod6.z.string().min(2).max(100)
  // "service:Desarrollo Web", "product:ERP", "tool:X", "general"
});
var recruiterContactSchema = import_zod6.z.object({
  firstName: import_zod6.z.string().min(2).max(50),
  email: import_zod6.z.string().email("Invalid email format"),
  whatsapp: import_zod6.z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  message: import_zod6.z.string().min(10).max(2e3)
});
var contactFormSchema = import_zod6.z.discriminatedUnion("originType", [
  clientContactSchema.extend({ originType: import_zod6.z.literal("CLIENT") }),
  recruiterContactSchema.extend({ originType: import_zod6.z.literal("RECRUITER") })
]);
var contactFormFilterSchema = import_zod6.z.object({
  search: import_zod6.z.string().optional(),
  isRead: import_zod6.z.coerce.boolean().optional(),
  isArchived: import_zod6.z.coerce.boolean().optional(),
  isStarred: import_zod6.z.coerce.boolean().optional(),
  label: import_zod6.z.string().optional(),
  originType: formOriginEnum.optional(),
  page: import_zod6.z.coerce.number().int().min(1).default(1),
  limit: import_zod6.z.coerce.number().int().min(1).max(100).default(20)
});

// src/schemas/login.schema.ts
var import_zod7 = require("zod");
var loginSchema = import_zod7.z.object({
  username: import_zod7.z.string().min(3, "Username must be at least 3 characters").max(50),
  password: import_zod7.z.string().min(6, "Password must be at least 6 characters")
});
var jwtPayloadSchema = import_zod7.z.object({
  userId: import_zod7.z.string(),
  username: import_zod7.z.string(),
  role: import_zod7.z.enum(["ADMIN"]).default("ADMIN")
});

// src/schemas/siteSection.schema.ts
var import_zod8 = require("zod");
var siteSectionSchema = import_zod8.z.object({
  key: import_zod8.z.string().min(2),
  label: import_zod8.z.string().min(2),
  visible: import_zod8.z.boolean().default(true),
  order: import_zod8.z.number().int().min(0).default(0)
});
var siteSectionUpdateSchema = import_zod8.z.object({
  visible: import_zod8.z.boolean().optional(),
  label: import_zod8.z.string().min(2).optional()
});
var siteSectionReorderSchema = import_zod8.z.object({
  sections: import_zod8.z.array(import_zod8.z.object({
    id: import_zod8.z.string(),
    order: import_zod8.z.number().int().min(0)
  }))
});

// src/schemas/profile.schema.ts
var import_zod9 = require("zod");
var updateProfileSchema = import_zod9.z.object({
  username: import_zod9.z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  email: import_zod9.z.string().email("Invalid email format").nullable().optional(),
  currentPassword: import_zod9.z.string().min(1, "Current password is required")
});
var sendVerificationCodeSchema = import_zod9.z.object({});
var changePasswordSchema = import_zod9.z.object({
  verificationCode: import_zod9.z.string().length(6, "Code must be exactly 6 characters"),
  newPassword: import_zod9.z.string().min(6, "Password must be at least 6 characters")
});

// src/api-client/client.ts
function createApiClient(config) {
  const { baseUrl, onUnauthorized, getToken } = config;
  function buildUrl(path, params) {
    let resolvedBase = baseUrl;
    if (!resolvedBase.startsWith("http")) {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      resolvedBase = `${origin}${resolvedBase.startsWith("/") ? "" : "/"}${resolvedBase}`;
    }
    const cleanBase = resolvedBase.endsWith("/") ? resolvedBase.slice(0, -1) : resolvedBase;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${cleanBase}${cleanPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
  function buildHeaders(customHeaders, skipAuth) {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders
    };
    if (!skipAuth && getToken) {
      const token = getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }
  async function request(method, path, body, options) {
    const url = buildUrl(path, options?.params);
    const headers = buildHeaders(options?.headers, options?.skipAuth);
    const init = {
      method,
      headers
    };
    if (body !== void 0 && method !== "GET") {
      init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    if (!response.ok) {
      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        const error = {
          message: "Unauthorized - please log in again",
          status: 401,
          code: "UNAUTHORIZED"
        };
        throw error;
      }
      let errorBody;
      try {
        const parsed = await response.json();
        errorBody = {
          message: parsed.message ?? response.statusText,
          status: response.status,
          code: parsed.code,
          details: parsed.details
        };
      } catch {
        errorBody = {
          message: response.statusText,
          status: response.status
        };
      }
      throw errorBody;
    }
    if (response.status === 204) {
      return void 0;
    }
    return response.json();
  }
  return {
    /** GET request */
    get(path, options) {
      return request("GET", path, void 0, options);
    },
    /** POST request */
    post(path, body, options) {
      return request("POST", path, body, options);
    },
    /** PUT request */
    put(path, body, options) {
      return request("PUT", path, body, options);
    },
    /** PATCH request */
    patch(path, body, options) {
      return request("PATCH", path, body, options);
    },
    /** DELETE request */
    delete(path, options) {
      return request("DELETE", path, void 0, options);
    }
  };
}

// src/components/ui/Button/Button.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var styles = {
  button: "button",
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
  whatsapp: "whatsapp",
  sm: "sm",
  md: "md",
  lg: "lg",
  large: "large",
  full: "full",
  loading: "loading",
  spinner: "spinner",
  hiddenContent: "hiddenContent"
};
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      className: classNames,
      disabled: disabled || loading,
      ...rest,
      children: [
        loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles.spinner, "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: loading ? styles.hiddenContent : "", children })
      ]
    }
  );
}

// src/components/ui/Input/Input.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var styles2 = {
  wrapper: "wrapper",
  label: "label",
  input: "input",
  inputError: "inputError",
  error: "error"
};
function Input({
  label,
  error,
  id,
  className,
  type = "text",
  ...rest
}) {
  const inputClassNames = [
    styles2.input,
    error ? styles2.inputError : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: styles2.wrapper, children: [
    label && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { htmlFor: id, className: styles2.label, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "input",
      {
        id,
        type,
        className: inputClassNames,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error ? `${id}-error` : void 0,
        ...rest
      }
    ),
    error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { id: `${id}-error`, className: styles2.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Card/Card.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var styles3 = {
  card: "card",
  image: "image",
  badge: "badge",
  header: "header",
  body: "body",
  footer: "footer"
};
function Card({ header, children, footer, badge, image, className }) {
  const classNames = [styles3.card, className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: classNames, children: [
    image && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: image, alt: "", className: styles3.image, loading: "lazy" }),
    badge && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: styles3.badge, children: badge }),
    header && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: styles3.header, children: header }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: styles3.body, children }),
    footer && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: styles3.footer, children: footer })
  ] });
}

// src/components/ui/Badge/Badge.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var styles4 = {
  badge: "badge",
  default: "default",
  developing: "developing",
  available: "available",
  coming: "coming"
};
function Badge({ children, variant = "default", className }) {
  const classNames = [styles4.badge, styles4[variant], className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: classNames, children });
}

// src/components/ui/Loading/Loading.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var styles5 = {
  container: "container",
  spinner: "spinner",
  sm: "sm",
  md: "md",
  lg: "lg",
  srOnly: "srOnly"
};
function Loading({ size = "md", label = "Loading...", className }) {
  const classNames = [styles5.spinner, styles5[size], className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: styles5.container, role: "status", "aria-label": label, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: classNames, "aria-hidden": "true" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: styles5.srOnly, children: label })
  ] });
}

// src/components/ui/ErrorMessage/ErrorMessage.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var styles6 = {
  container: "container",
  icon: "icon",
  message: "message",
  content: "content",
  retryButton: "retryButton"
};
function ErrorMessage({
  message,
  onRetry,
  children,
  className
}) {
  const classNames = [styles6.container, className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: classNames, role: "alert", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: styles6.icon, "aria-hidden": "true", children: "!" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: styles6.message, children: message }),
    children && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: styles6.content, children }),
    onRetry && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        className: styles6.retryButton,
        onClick: onRetry,
        children: "Retry"
      }
    )
  ] });
}

// src/components/ui/Modal/Modal.tsx
var import_react = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
var styles7 = {
  overlay: "overlay",
  modal: "modal",
  header: "header",
  title: "title",
  closeButton: "closeButton",
  body: "body"
};
function Modal({
  isOpen,
  onClose,
  title,
  children,
  className
}) {
  const handleKeyDown = (0, import_react.useCallback)(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );
  (0, import_react.useEffect)(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);
  if (!isOpen) return null;
  const handleBackdropClick = () => {
    onClose();
  };
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  const modalClassNames = [styles7.modal, className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      className: styles7.overlay,
      onClick: handleBackdropClick,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title ?? "Modal",
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: modalClassNames, onClick: handleContentClick, children: [
        (title || true) && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: styles7.header, children: [
          title && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: styles7.title, children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              className: styles7.closeButton,
              onClick: onClose,
              "aria-label": "Close modal",
              children: "\xD7"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: styles7.body, children })
      ] })
    }
  );
}

// src/components/ui/Textarea/Textarea.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var styles8 = {
  wrapper: "wrapper",
  label: "label",
  textarea: "textarea",
  textareaError: "textareaError",
  error: "error"
};
function Textarea({
  label,
  error,
  id,
  className,
  ...rest
}) {
  const textareaClassNames = [
    styles8.textarea,
    error ? styles8.textareaError : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: styles8.wrapper, children: [
    label && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { htmlFor: id, className: styles8.label, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "textarea",
      {
        id,
        className: textareaClassNames,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error ? `${id}-error` : void 0,
        ...rest
      }
    ),
    error && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { id: `${id}-error`, className: styles8.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Select/Select.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var styles9 = {
  wrapper: "wrapper",
  label: "label",
  select: "select",
  selectError: "selectError",
  error: "error"
};
function Select({
  label,
  error,
  id,
  options,
  className,
  ...rest
}) {
  const selectClassNames = [
    styles9.select,
    error ? styles9.selectError : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: styles9.wrapper, children: [
    label && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("label", { htmlFor: id, className: styles9.label, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("select", { id, className: selectClassNames, ...rest, children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: opt.value, children: opt.label }, opt.value)) }),
    error && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { id: `${id}-error`, className: styles9.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Checkbox/Checkbox.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var styles10 = {
  wrapper: "wrapper",
  checkbox: "checkbox",
  label: "label"
};
function Checkbox({
  label,
  id,
  className,
  ...rest
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: styles10.wrapper, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "input",
      {
        type: "checkbox",
        id,
        className: `${styles10.checkbox} ${className ?? ""}`,
        ...rest
      }
    ),
    label && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("label", { htmlFor: id, className: styles10.label, children: label })
  ] });
}

// src/components/auth/ProtectedRoute.tsx
var import_react_router_dom = require("react-router-dom");
var import_jsx_runtime11 = require("react/jsx-runtime");
function ProtectedRoute({
  isAuthenticated,
  children,
  redirectTo = "/login"
}) {
  if (!isAuthenticated) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_router_dom.Navigate, { to: redirectTo, replace: true });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_jsx_runtime11.Fragment, { children });
}

// src/components/ui/ErrorBoundary/ErrorBoundary.tsx
var import_react2 = __toESM(require("react"));

// src/components/ui/ErrorBoundary/ErrorBoundary.module.css
var ErrorBoundary_default = {};

// src/components/ui/ErrorBoundary/ErrorFallback.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function ErrorFallback({
  onReset,
  title = "Algo sali\xF3 mal",
  message = "Ocurri\xF3 un error inesperado. Por favor, intenta de nuevo."
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: ErrorBoundary_default.container, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: ErrorBoundary_default.card, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("h2", { className: ErrorBoundary_default.title, children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: ErrorBoundary_default.message, children: message }),
    onReset && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { className: ErrorBoundary_default.retryButton, onClick: onReset, children: "Reintentar" })
  ] }) });
}

// src/components/ui/ErrorBoundary/ErrorBoundary.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var ErrorBoundary = class extends import_react2.default.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught an error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ErrorFallback, { onReset: this.handleReset });
    }
    return this.props.children;
  }
};

// src/components/ui/ErrorBoundary/withBoundary.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function withBoundary(Component, fallback) {
  return function WithBoundary(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ErrorBoundary, { fallback, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Component, { ...props }) });
  };
}
//# sourceMappingURL=index.js.map