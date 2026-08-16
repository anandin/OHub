import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { EmailAuthForm } from "@/components/EmailAuthForm";
import { MIN_PASSWORD } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

/**
 * The email form's job is to be honest about what happened without becoming a
 * way to ask oHub who has an account. These tests cover that boundary and the
 * states a student can actually get stuck in.
 */

const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();
const mockSendPasswordReset = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  ...jest.requireActual("@/context/AuthContext"),
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signUpWithEmail: mockSignUpWithEmail,
    sendPasswordReset: mockSendPasswordReset,
  }),
}));

function renderForm() {
  return render(
    <ThemeProvider>
      <EmailAuthForm />
    </ThemeProvider>,
  );
}

async function type(label: string, value: string) {
  const field = await screen.findByLabelText(label);
  await act(async () => {
    fireEvent.changeText(field, value);
  });
}

async function press(name: RegExp | string) {
  const control = await screen.findByLabelText(name);
  await act(async () => {
    fireEvent.press(control);
  });
}

beforeEach(() => {
  mockSignInWithEmail.mockReset().mockResolvedValue({ ok: true });
  mockSignUpWithEmail.mockReset().mockResolvedValue({ ok: true });
  mockSendPasswordReset.mockReset().mockResolvedValue({ ok: true });
});

describe("signing in", () => {
  it("passes what was typed straight through", async () => {
    renderForm();
    await type("Email address", "  Student@Example.COM ");
    await type("Password", "correct horse battery");
    await press(/^Sign in$/);

    expect(mockSignInWithEmail).toHaveBeenCalledWith(
      "  Student@Example.COM ",
      "correct horse battery",
    );
  });

  it("shows the failure instead of silently doing nothing", async () => {
    mockSignInWithEmail.mockResolvedValue({
      ok: false,
      message: "That email and password do not match an account.",
    });

    renderForm();
    await type("Email address", "a@b.co");
    await type("Password", "wrong");
    await press(/^Sign in$/);

    await waitFor(() => {
      expect(screen.getByText(/do not match an account/i)).toBeTruthy();
    });
  });

  it("re-enables the button after a failure so it can be retried", async () => {
    mockSignInWithEmail.mockResolvedValue({ ok: false, message: "Nope." });

    renderForm();
    await type("Email address", "a@b.co");
    await type("Password", "wrong");
    await press(/^Sign in$/);

    await waitFor(() => {
      expect(screen.getByLabelText(/^Sign in$/).props.accessibilityState.disabled).toBe(
        false,
      );
    });
  });
});

describe("creating an account", () => {
  it("asks for a password long enough to be worth having", async () => {
    renderForm();
    await press(/Create an account with email instead/);
    expect(screen.getByText(new RegExp(`At least ${MIN_PASSWORD} characters`))).toBeTruthy();
  });

  it("lands on a check-your-email state rather than hanging", async () => {
    mockSignUpWithEmail.mockResolvedValue({ ok: true, needsConfirmation: true });

    renderForm();
    await press(/Create an account with email instead/);
    await type("Email address", "new@student.ca");
    await type("Password", "three unrelated words");
    await press(/^Create account$/);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeTruthy();
    });
    expect(screen.getByText(/new@student\.ca/)).toBeTruthy();
  });

  it("does not reveal that an address is already registered", async () => {
    // Supabase returns a decoy user for an existing address precisely so this
    // endpoint cannot be used to enumerate accounts. The UI must not undo that.
    mockSignUpWithEmail.mockResolvedValue({ ok: true, needsConfirmation: true });

    renderForm();
    await press(/Create an account with email instead/);
    await type("Email address", "taken@student.ca");
    await type("Password", "three unrelated words");
    await press(/^Create account$/);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeTruthy();
    });
    expect(screen.queryByText(/already/i)).toBeNull();
    expect(screen.queryByText(/exists/i)).toBeNull();
    expect(screen.queryByText(/registered/i)).toBeNull();
  });
});

describe("forgotten password", () => {
  it("asks for an email and nothing else", async () => {
    renderForm();
    await press(/Reset a forgotten password/);

    expect(screen.getByLabelText("Email address")).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });

  it("answers the same way whether or not the account exists", async () => {
    renderForm();
    await press(/Reset a forgotten password/);
    await type("Email address", "someone@else.ca");
    await press(/^Send a reset link$/);

    await waitFor(() => {
      expect(screen.getByText(/if that address has an account/i)).toBeTruthy();
    });
    // The wording has to carry the reason, or the next person to touch this
    // "fixes" it into a helpful "no such account".
    expect(screen.getByText(/would let anyone check who uses oHub/i)).toBeTruthy();
  });

  it("offers a way back rather than stranding them on the sent screen", async () => {
    renderForm();
    await press(/Reset a forgotten password/);
    await type("Email address", "someone@else.ca");
    await press(/^Send a reset link$/);

    await waitFor(() => screen.getByLabelText(/Back to sign in/));
    await press(/Back to sign in/);
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });
});

describe("the password field", () => {
  it("is masked until the student asks to see it", async () => {
    renderForm();
    const field = screen.getByLabelText("Password");
    expect(field.props.secureTextEntry).toBe(true);

    await press(/Show password/);
    expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(false);
  });

  it("tells a password manager which password it wants", async () => {
    renderForm();
    expect(screen.getByLabelText("Password").props.autoComplete).toBe("current-password");

    await press(/Create an account with email instead/);
    expect(screen.getByLabelText("Password").props.autoComplete).toBe("new-password");
  });
});
