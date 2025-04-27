export const postLogin = async (formData) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};

export const postSignup = async (formData) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to signup");
  }
  return res.json();
};

export const postForgotPassword = async (email) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/user/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, frontendUrl: window.location.origin }),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};

export const putResetPassword = async (formData) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/user/reset-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};
