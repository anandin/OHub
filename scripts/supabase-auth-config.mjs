#!/usr/bin/env node
/**
 * Read or write the project's auth configuration.
 *
 * Site URL, the redirect allow list and the email templates are platform
 * settings, not database state, so they are unreachable from SQL and from the
 * app. They are also exactly the settings that silently break sign-up: a Site
 * URL left on its `http://localhost:3000` default sends every confirmation
 * link in production to a machine that is not running.
 *
 * Keeping them here rather than in a dashboard means the templates are
 * reviewable in a diff and a wrong redirect target is a one-line fix rather
 * than an archaeology exercise.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-auth-config.mjs show
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-auth-config.mjs apply
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "brnusefzmfvkithtuobv";
const SITE_URL = process.env.OHUB_SITE_URL ?? "https://o-hub-api-server.vercel.app";

const token = process.env.SUPABASE_ACCESS_TOKEN ?? process.env.SUPABASE_KEY;
if (!token) {
  console.error(
    "No SUPABASE_ACCESS_TOKEN. Create a personal access token at\n" +
      "https://supabase.com/dashboard/account/tokens and export it.",
  );
  process.exit(1);
}

const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

async function call(method, body) {
  const response = await fetch(API, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${response.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : {};
}

function template(name) {
  return readFileSync(join(HERE, "..", "emails", name), "utf8");
}

/**
 * Every setting sign-up depends on, in one place.
 *
 * `uri_allow_list` matters as much as `site_url`: Supabase silently falls back
 * to the Site URL when a requested `redirectTo` is not on the list, so an
 * incomplete list does not error — it just sends people somewhere else.
 */
const ROUTING = {
  site_url: SITE_URL,
  uri_allow_list: [
    `${SITE_URL}/**`,
    // Vercel preview deployments, so a test build's links come back to it.
    "https://*.vercel.app/**",
    // The Expo dev client and a local web build.
    "ohub://**",
    "http://localhost:8081/**",
  ].join(","),

  // Confirming an address should not be a chore that expires while a student
  // is in class. Twenty-four hours, and the reset link stays short.
  mailer_otp_exp: 86400,

  // The form asks for ten; without this the server still accepts six, and the
  // form is not the boundary.
  password_min_length: 10,
};

/**
 * The templates, which the API refuses on the free tier while the project is
 * still on Supabase's built-in sender:
 *
 *   "Email template modification is not available for free tier projects using
 *    the default email provider."
 *
 * They are applied separately for that reason. It also settles an open
 * question about custom SMTP: it is not only about the ~3/hour send limit, it
 * is the only way to stop the confirmation email looking like a phishing
 * attempt, because the default template cannot be changed at all.
 */
const TEMPLATES = {
  mailer_subjects_confirmation: "Confirm your email and open oHub",
  mailer_templates_confirmation_content: template("confirm-signup.html"),

  mailer_subjects_recovery: "Reset your oHub password",
  mailer_templates_recovery_content: template("reset-password.html"),

  mailer_subjects_magic_link: "Your oHub sign-in link",
  mailer_templates_magic_link_content: template("magic-link.html"),

  mailer_subjects_email_change: "Confirm your new email address for oHub",
  mailer_templates_email_change_content: template("email-change.html"),
};

const KEYS_WORTH_SHOWING = [
  "site_url",
  "uri_allow_list",
  "mailer_otp_exp",
  "external_google_enabled",
  "external_email_enabled",
  "mailer_autoconfirm",
  "password_min_length",
  "disable_signup",
  "smtp_host",
  "smtp_sender_name",
  "mailer_subjects_confirmation",
];

const command = process.argv[2] ?? "show";

if (command === "show") {
  const current = await call("GET");
  for (const key of KEYS_WORTH_SHOWING) {
    console.log(`${key.padEnd(28)} ${JSON.stringify(current[key])}`);
  }
} else if (command === "apply") {
  // Routing first and on its own. It is what makes a confirmation link land on
  // the app instead of localhost, and it must not be held up by the templates
  // failing on a plan restriction.
  await call("PATCH", ROUTING);
  console.log("Routing and password policy applied.");

  try {
    await call("PATCH", TEMPLATES);
    console.log("Email templates applied.");
  } catch (error) {
    console.log(`\nEmail templates NOT applied: ${error.message.slice(0, 200)}`);
    console.log(
      "Configure custom SMTP (Authentication -> Emails -> SMTP Settings), then\n" +
        "re-run this script. Until then Supabase sends its own unbranded default,\n" +
        "which is the email that reads as phishing.",
    );
  }

  const after = await call("GET");
  console.log("\nNow:");
  for (const key of ["site_url", "uri_allow_list", "mailer_otp_exp", "password_min_length"]) {
    console.log(`  ${key.padEnd(20)} ${JSON.stringify(after[key])}`);
  }
  const branded = (after.mailer_templates_confirmation_content ?? "").includes("oHub");
  console.log(`  templates            ${branded ? "branded" : "Supabase default"}`);
} else {
  console.error(`Unknown command "${command}". Use "show" or "apply".`);
  process.exit(1);
}
