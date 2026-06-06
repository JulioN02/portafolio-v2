// src/schemas/service.schema.ts
import { z as z2 } from "zod";

// src/schemas/blogPost.schema.ts
import { z } from "zod";
var postStatusEnum = z.enum(["DRAFT", "PUBLISHED", "PRIVATE", "ARCHIVED"]);
var blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  category: z.string().min(2).max(50),
  shortDescription: z.string().min(10).max(500),
  coverImage: z.string().url(),
  mediaGallery: z.array(z.string().url()).optional(),
  body: z.string().min(100, "Body must be at least 100 characters").max(5e4),
  externalLink: z.string().url().optional(),
  lessonsLearned: z.string().max(2e4).optional(),
  status: postStatusEnum.default("DRAFT")
});
var blogPostUpdateSchema = blogPostSchema.partial();
var blogPostFilterSchema = z.object({
  status: postStatusEnum.optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});
var blogPostStatusSchema = z.object({
  status: postStatusEnum
});

// src/schemas/service.schema.ts
var serviceSchema = z2.object({
  title: z2.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z2.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: z2.string().min(2, "Classification must be at least 2 characters").max(50),
  shortDescription: z2.string().min(10, "Short description must be at least 10 characters").max(300),
  fullDescription: z2.string().min(50, "Full description must be at least 50 characters"),
  includedItems: z2.array(z2.string().min(3)).min(1, "At least one included item is required"),
  images: z2.array(z2.string().url()).min(1, "At least one image is required"),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: z2.string().max(15e3).optional(),
  technicalImages: z2.array(z2.string().url()).optional()
});
var serviceUpdateSchema = serviceSchema.partial();
var serviceFilterSchema = z2.object({
  status: postStatusEnum.optional(),
  classification: z2.string().optional(),
  page: z2.coerce.number().int().min(1).default(1),
  limit: z2.coerce.number().int().min(1).max(100).default(10)
});
var serviceStatusSchema = z2.object({
  status: postStatusEnum
});

// src/schemas/product.schema.ts
import { z as z3 } from "zod";
var productSchema = z3.object({
  title: z3.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z3.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: z3.string().min(2).max(50),
  shortDescription: z3.string().min(10).max(300),
  fullDescription: z3.string().min(50),
  images: z3.array(z3.string().url()).min(1),
  externalLink: z3.string().url().optional(),
  featured: z3.boolean().default(false),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: z3.string().max(15e3).optional(),
  technicalImages: z3.array(z3.string().url()).optional()
});
var productUpdateSchema = productSchema.partial();
var productFilterSchema = z3.object({
  featured: z3.coerce.boolean().optional(),
  status: postStatusEnum.optional(),
  classification: z3.string().optional(),
  page: z3.coerce.number().int().min(1).default(1),
  limit: z3.coerce.number().int().min(1).max(100).default(10)
});
var productStatusSchema = z3.object({
  status: postStatusEnum
});

// src/schemas/tool.schema.ts
import { z as z4 } from "zod";
var toolSchema = z4.object({
  title: z4.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z4.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  classification: z4.string().min(2).max(50),
  shortDescription: z4.string().min(10).max(300),
  fullDescription: z4.string().min(50),
  images: z4.array(z4.string().url()).min(1),
  requiresInstall: z4.boolean().default(false),
  featured: z4.boolean().default(false),
  status: postStatusEnum.default("DRAFT"),
  // Technical fields for recruiters (optional)
  technicalExplanation: z4.string().max(15e3).optional(),
  technicalImages: z4.array(z4.string().url()).optional()
});
var toolUpdateSchema = toolSchema.partial();
var toolFilterSchema = z4.object({
  featured: z4.coerce.boolean().optional(),
  status: postStatusEnum.optional(),
  classification: z4.string().optional(),
  page: z4.coerce.number().int().min(1).default(1),
  limit: z4.coerce.number().int().min(1).max(100).default(10)
});
var toolStatusSchema = z4.object({
  status: postStatusEnum
});

// src/schemas/successCase.schema.ts
import { z as z5 } from "zod";
var successCaseSchema = z5.object({
  title: z5.string().min(3, "Title must be at least 3 characters").max(100),
  slug: z5.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z5.string().min(10).max(1e3),
  images: z5.array(z5.string().url()).min(1),
  videos: z5.array(z5.string().url()).optional(),
  links: z5.array(z5.string().url()).optional(),
  status: postStatusEnum.default("DRAFT")
});
var successCaseUpdateSchema = successCaseSchema.partial();
var successCaseFilterSchema = z5.object({
  status: postStatusEnum.optional(),
  classification: z5.string().optional(),
  page: z5.coerce.number().int().min(1).default(1),
  limit: z5.coerce.number().int().min(1).max(100).default(10)
});
var successCaseStatusSchema = z5.object({
  status: postStatusEnum
});

// src/schemas/contact.schema.ts
import { z as z6 } from "zod";
var formOriginEnum = z6.enum(["CLIENT", "RECRUITER"]);
var clientContactSchema = z6.object({
  firstName: z6.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z6.string().min(2).max(50).optional(),
  whatsapp: z6.string().regex(/^\+?[0-9]{10,15}$/, "Invalid WhatsApp number format").optional(),
  email: z6.string().email("Invalid email format"),
  message: z6.string().min(10, "Message must be at least 10 characters").max(2e3),
  source: z6.string().min(2).max(100)
  // "service:Desarrollo Web", "product:ERP", "tool:X", "general"
});
var recruiterContactSchema = z6.object({
  firstName: z6.string().min(2).max(50),
  email: z6.string().email("Invalid email format"),
  whatsapp: z6.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  message: z6.string().min(10).max(2e3)
});
var contactFormSchema = z6.discriminatedUnion("originType", [
  clientContactSchema.extend({ originType: z6.literal("CLIENT") }),
  recruiterContactSchema.extend({ originType: z6.literal("RECRUITER") })
]);
var contactFormFilterSchema = z6.object({
  search: z6.string().optional(),
  isRead: z6.coerce.boolean().optional(),
  isArchived: z6.coerce.boolean().optional(),
  isStarred: z6.coerce.boolean().optional(),
  label: z6.string().optional(),
  originType: formOriginEnum.optional(),
  page: z6.coerce.number().int().min(1).default(1),
  limit: z6.coerce.number().int().min(1).max(100).default(20)
});

// src/schemas/login.schema.ts
import { z as z7 } from "zod";
var loginSchema = z7.object({
  username: z7.string().min(3, "Username must be at least 3 characters").max(50),
  password: z7.string().min(6, "Password must be at least 6 characters")
});
var jwtPayloadSchema = z7.object({
  userId: z7.string(),
  username: z7.string(),
  role: z7.enum(["ADMIN"]).default("ADMIN")
});

// src/schemas/siteSection.schema.ts
import { z as z8 } from "zod";
var siteSectionSchema = z8.object({
  key: z8.string().min(2),
  label: z8.string().min(2),
  visible: z8.boolean().default(true),
  order: z8.number().int().min(0).default(0)
});
var siteSectionUpdateSchema = z8.object({
  visible: z8.boolean().optional(),
  label: z8.string().min(2).optional()
});
var siteSectionReorderSchema = z8.object({
  sections: z8.array(z8.object({
    id: z8.string(),
    order: z8.number().int().min(0)
  }))
});

// src/schemas/profile.schema.ts
import { z as z9 } from "zod";
var updateProfileSchema = z9.object({
  username: z9.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  email: z9.string().email("Invalid email format").nullable().optional(),
  currentPassword: z9.string().min(1, "Current password is required")
});
var sendVerificationCodeSchema = z9.object({});
var changePasswordSchema = z9.object({
  verificationCode: z9.string().length(6, "Code must be exactly 6 characters"),
  newPassword: z9.string().min(6, "Password must be at least 6 characters")
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
import { jsx, jsxs } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: classNames,
      disabled: disabled || loading,
      ...rest,
      children: [
        loading && /* @__PURE__ */ jsx("span", { className: styles.spinner, "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: loading ? styles.hiddenContent : "", children })
      ]
    }
  );
}

// src/components/ui/Input/Input.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs2("div", { className: styles2.wrapper, children: [
    label && /* @__PURE__ */ jsx2("label", { htmlFor: id, className: styles2.label, children: label }),
    /* @__PURE__ */ jsx2(
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
    error && /* @__PURE__ */ jsx2("span", { id: `${id}-error`, className: styles2.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Card/Card.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs3("div", { className: classNames, children: [
    image && /* @__PURE__ */ jsx3("img", { src: image, alt: "", className: styles3.image, loading: "lazy" }),
    badge && /* @__PURE__ */ jsx3("div", { className: styles3.badge, children: badge }),
    header && /* @__PURE__ */ jsx3("div", { className: styles3.header, children: header }),
    /* @__PURE__ */ jsx3("div", { className: styles3.body, children }),
    footer && /* @__PURE__ */ jsx3("div", { className: styles3.footer, children: footer })
  ] });
}

// src/components/ui/Badge/Badge.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var styles4 = {
  badge: "badge",
  default: "default",
  developing: "developing",
  available: "available",
  coming: "coming"
};
function Badge({ children, variant = "default", className }) {
  const classNames = [styles4.badge, styles4[variant], className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx4("span", { className: classNames, children });
}

// src/components/ui/Loading/Loading.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs4("div", { className: styles5.container, role: "status", "aria-label": label, children: [
    /* @__PURE__ */ jsx5("div", { className: classNames, "aria-hidden": "true" }),
    /* @__PURE__ */ jsx5("span", { className: styles5.srOnly, children: label })
  ] });
}

// src/components/ui/ErrorMessage/ErrorMessage.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs5("div", { className: classNames, role: "alert", children: [
    /* @__PURE__ */ jsx6("div", { className: styles6.icon, "aria-hidden": "true", children: "!" }),
    /* @__PURE__ */ jsx6("p", { className: styles6.message, children: message }),
    children && /* @__PURE__ */ jsx6("div", { className: styles6.content, children }),
    onRetry && /* @__PURE__ */ jsx6(
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
import { useEffect, useCallback } from "react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
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
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );
  useEffect(() => {
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
  return /* @__PURE__ */ jsx7(
    "div",
    {
      className: styles7.overlay,
      onClick: handleBackdropClick,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title ?? "Modal",
      children: /* @__PURE__ */ jsxs6("div", { className: modalClassNames, onClick: handleContentClick, children: [
        (title || true) && /* @__PURE__ */ jsxs6("div", { className: styles7.header, children: [
          title && /* @__PURE__ */ jsx7("h2", { className: styles7.title, children: title }),
          /* @__PURE__ */ jsx7(
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
        /* @__PURE__ */ jsx7("div", { className: styles7.body, children })
      ] })
    }
  );
}

// src/components/ui/Textarea/Textarea.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs7("div", { className: styles8.wrapper, children: [
    label && /* @__PURE__ */ jsx8("label", { htmlFor: id, className: styles8.label, children: label }),
    /* @__PURE__ */ jsx8(
      "textarea",
      {
        id,
        className: textareaClassNames,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error ? `${id}-error` : void 0,
        ...rest
      }
    ),
    error && /* @__PURE__ */ jsx8("span", { id: `${id}-error`, className: styles8.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Select/Select.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs8("div", { className: styles9.wrapper, children: [
    label && /* @__PURE__ */ jsx9("label", { htmlFor: id, className: styles9.label, children: label }),
    /* @__PURE__ */ jsx9("select", { id, className: selectClassNames, ...rest, children: options.map((opt) => /* @__PURE__ */ jsx9("option", { value: opt.value, children: opt.label }, opt.value)) }),
    error && /* @__PURE__ */ jsx9("span", { id: `${id}-error`, className: styles9.error, role: "alert", children: error })
  ] });
}

// src/components/ui/Checkbox/Checkbox.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs9("div", { className: styles10.wrapper, children: [
    /* @__PURE__ */ jsx10(
      "input",
      {
        type: "checkbox",
        id,
        className: `${styles10.checkbox} ${className ?? ""}`,
        ...rest
      }
    ),
    label && /* @__PURE__ */ jsx10("label", { htmlFor: id, className: styles10.label, children: label })
  ] });
}

// src/components/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { Fragment, jsx as jsx11 } from "react/jsx-runtime";
function ProtectedRoute({
  isAuthenticated,
  children,
  redirectTo = "/login"
}) {
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx11(Navigate, { to: redirectTo, replace: true });
  }
  return /* @__PURE__ */ jsx11(Fragment, { children });
}

// src/components/ui/ErrorBoundary/ErrorBoundary.tsx
import React from "react";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var ErrorBoundary = class extends React.Component {
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
      return /* @__PURE__ */ jsxs10("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        minHeight: "300px"
      }, children: [
        /* @__PURE__ */ jsx12("h2", { style: { fontSize: "1.5rem", marginBottom: "8px", color: "#333" }, children: "Algo sali\xF3 mal" }),
        /* @__PURE__ */ jsx12("p", { style: { fontSize: "1rem", color: "#666", marginBottom: "24px" }, children: "Ocurri\xF3 un error inesperado. Por favor, intenta de nuevo." }),
        /* @__PURE__ */ jsx12(
          "button",
          {
            onClick: this.handleReset,
            style: {
              padding: "12px 32px",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            },
            children: "Reintentar"
          }
        )
      ] });
    }
    return this.props.children;
  }
};

// src/components/ui/ErrorBoundary/ErrorFallback.tsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
function ErrorFallback({
  onReset,
  title = "Algo sali\xF3 mal",
  message = "Ocurri\xF3 un error inesperado. Por favor, intenta de nuevo."
}) {
  return /* @__PURE__ */ jsxs11("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center",
    minHeight: "300px"
  }, children: [
    /* @__PURE__ */ jsx13("h2", { style: { fontSize: "1.5rem", marginBottom: "8px", color: "#333" }, children: title }),
    /* @__PURE__ */ jsx13("p", { style: { fontSize: "1rem", color: "#666", marginBottom: "24px" }, children: message }),
    onReset && /* @__PURE__ */ jsx13(
      "button",
      {
        onClick: onReset,
        style: {
          padding: "12px 32px",
          fontSize: "1rem",
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#2563eb",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        },
        children: "Reintentar"
      }
    )
  ] });
}

// src/components/ui/ErrorBoundary/withBoundary.tsx
import { jsx as jsx14 } from "react/jsx-runtime";
function withBoundary(Component, fallback) {
  return function WithBoundary(props) {
    return /* @__PURE__ */ jsx14(ErrorBoundary, { fallback, children: /* @__PURE__ */ jsx14(Component, { ...props }) });
  };
}
export {
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorBoundary,
  ErrorFallback,
  ErrorMessage,
  Input,
  Loading,
  Modal,
  ProtectedRoute,
  Select,
  Textarea,
  blogPostFilterSchema,
  blogPostSchema,
  blogPostStatusSchema,
  blogPostUpdateSchema,
  changePasswordSchema,
  clientContactSchema,
  contactFormFilterSchema,
  contactFormSchema,
  createApiClient,
  formOriginEnum,
  jwtPayloadSchema,
  loginSchema,
  postStatusEnum,
  productFilterSchema,
  productSchema,
  productStatusSchema,
  productUpdateSchema,
  recruiterContactSchema,
  sendVerificationCodeSchema,
  serviceFilterSchema,
  serviceSchema,
  serviceStatusSchema,
  serviceUpdateSchema,
  siteSectionReorderSchema,
  siteSectionSchema,
  siteSectionUpdateSchema,
  successCaseFilterSchema,
  successCaseSchema,
  successCaseStatusSchema,
  successCaseUpdateSchema,
  toolFilterSchema,
  toolSchema,
  toolStatusSchema,
  toolUpdateSchema,
  updateProfileSchema,
  withBoundary
};
//# sourceMappingURL=index.mjs.map