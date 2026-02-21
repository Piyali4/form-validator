(() => {
  const form = document.getElementById("signup-form");
  const fullNameInput = document.getElementById("full-name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordMeterFill = document.getElementById("password-meter-fill");
  const passwordStrengthText = document.getElementById("password-strength-text");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
  const formStatus = document.getElementById("form-status");

  if (
    !form ||
    !fullNameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !passwordMeterFill ||
    !passwordStrengthText ||
    !formStatus
  ) {
    return;
  }

  function setFormStatus(message, type = "") {
    formStatus.textContent = message;
    formStatus.classList.remove("success", "error");
    if (type) {
      formStatus.classList.add(type);
    }
  }

  function getFieldErrorElement(input) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) {
      return null;
    }
    return formGroup.querySelector(".error-message");
  }

  function setFieldState(input, errorMessage) {
    const errorElement = getFieldErrorElement(input);
    if (!errorElement) {
      return;
    }

    if (errorMessage) {
      input.classList.add("invalid");
      input.classList.remove("valid");
      errorElement.textContent = errorMessage;
      return;
    }

    input.classList.remove("invalid");
    input.classList.add("valid");
    errorElement.textContent = "";
  }

  function clearFieldState(input) {
    const errorElement = getFieldErrorElement(input);
    input.classList.remove("valid", "invalid");
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function getPasswordStrength(password) {
    if (!password) {
      return { level: "", width: 0, label: "Strength: -" };
    }

    let score = 0;
    if (password.length >= 8) {
      score += 1;
    }
    if (password.length >= 12) {
      score += 1;
    }
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    }
    if (/\d/.test(password)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 2) {
      return { level: "weak", width: 34, label: "Strength: Weak" };
    }
    if (score <= 4) {
      return { level: "medium", width: 67, label: "Strength: Medium" };
    }
    return { level: "strong", width: 100, label: "Strength: Strong" };
  }

  function updatePasswordMeter() {
    const { level, width, label } = getPasswordStrength(passwordInput.value);

    passwordMeterFill.style.width = `${width}%`;
    passwordMeterFill.classList.remove("weak", "medium", "strong");
    passwordStrengthText.classList.remove("weak", "medium", "strong");

    if (level) {
      passwordMeterFill.classList.add(level);
      passwordStrengthText.classList.add(level);
    }

    passwordStrengthText.textContent = label;
  }

  function validateFullName() {
    const value = fullNameInput.value.trim();
    const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

    if (!value) {
      setFieldState(fullNameInput, "Full name is required.");
      return false;
    }

    if (value.length < 3) {
      setFieldState(fullNameInput, "Name must be at least 3 characters.");
      return false;
    }

    if (!namePattern.test(value)) {
      setFieldState(fullNameInput, "Only letters and spaces are allowed.");
      return false;
    }

    setFieldState(fullNameInput, "");
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      setFieldState(emailInput, "Email is required.");
      return false;
    }

    if (!emailPattern.test(value)) {
      setFieldState(emailInput, "Enter a valid email address.");
      return false;
    }

    setFieldState(emailInput, "");
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    const strength = getPasswordStrength(value);

    if (!value) {
      setFieldState(passwordInput, "Password is required.");
      return false;
    }

    if (value.length < 8) {
      setFieldState(passwordInput, "Password must be at least 8 characters.");
      return false;
    }

    if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
      setFieldState(
        passwordInput,
        "Use uppercase, lowercase, number, and one special symbol."
      );
      return false;
    }

    if (strength.level === "weak") {
      setFieldState(passwordInput, "Password is too weak. Use a stronger password.");
      return false;
    }

    setFieldState(passwordInput, "");
    return true;
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;

    if (!value) {
      setFieldState(confirmPasswordInput, "Please confirm your password.");
      return false;
    }

    if (value !== passwordInput.value) {
      setFieldState(confirmPasswordInput, "Passwords do not match.");
      return false;
    }

    setFieldState(confirmPasswordInput, "");
    return true;
  }

  function validateForm() {
    const validName = validateFullName();
    const validEmail = validateEmail();
    const validPassword = validatePassword();
    const validConfirm = validateConfirmPassword();
    return validName && validEmail && validPassword && validConfirm;
  }

  function handleLiveValidation(input, validator, useTrim = true) {
    input.addEventListener("blur", validator);
    input.addEventListener("input", () => {
      setFormStatus("");
      const hasValue = useTrim ? input.value.trim() !== "" : input.value !== "";
      if (input.classList.contains("invalid") || hasValue) {
        validator();
      }
    });
  }

  function resetPasswordVisibility() {
    passwordInput.type = "password";
    confirmPasswordInput.type = "password";
    togglePasswordButtons.forEach((button) => {
      button.dataset.visible = "false";
      button.setAttribute("aria-label", "Show password");
      button.setAttribute("aria-pressed", "false");
    });
  }

  function triggerToggleBounce(button) {
    button.classList.remove("is-bouncing");
    void button.offsetWidth;
    button.classList.add("is-bouncing");
  }

  togglePasswordButtons.forEach((button) => {
    button.addEventListener("animationend", (event) => {
      if (event.animationName === "toggle-micro-bounce") {
        button.classList.remove("is-bouncing");
      }
    });

    button.addEventListener("click", () => {
      const inputId = button.dataset.target;
      const targetInput = inputId ? document.getElementById(inputId) : null;
      if (!targetInput) {
        return;
      }

      triggerToggleBounce(button);

      const shouldShow = targetInput.type === "password";
      targetInput.type = shouldShow ? "text" : "password";
      button.dataset.visible = shouldShow ? "true" : "false";
      button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", shouldShow ? "true" : "false");
    });
  });

  handleLiveValidation(fullNameInput, validateFullName, true);
  handleLiveValidation(emailInput, validateEmail, true);
  handleLiveValidation(confirmPasswordInput, validateConfirmPassword, false);

  passwordInput.addEventListener("blur", () => {
    updatePasswordMeter();
    validatePassword();
    if (confirmPasswordInput.value !== "") {
      validateConfirmPassword();
    }
  });

  passwordInput.addEventListener("input", () => {
    setFormStatus("");
    updatePasswordMeter();

    if (passwordInput.classList.contains("invalid") || passwordInput.value !== "") {
      validatePassword();
    }

    if (
      confirmPasswordInput.classList.contains("invalid") ||
      confirmPasswordInput.value !== ""
    ) {
      validateConfirmPassword();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setFormStatus("Please fix the errors above.", "error");
      return;
    }

    setFormStatus("Account created successfully!", "success");
    form.reset();
    resetPasswordVisibility();
    updatePasswordMeter();
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearFieldState);
  });

  updatePasswordMeter();
})();
