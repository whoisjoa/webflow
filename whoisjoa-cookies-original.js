  document.addEventListener("DOMContentLoaded", function () {
    const domainName = window.location.hostname.replace("www.", "");
    const consentCookieName = `whoisjoa_cookie_consent`;

    const checkboxes = {
      marketing: document.querySelector("[joa-cookie-marketing]"),
      preferencias: document.querySelector("[joa-cookie-preferencias]"),
      estadisticas: document.querySelector("[joa-cookie-estadisticas]"),
    };

    let cookiesCategorizadas = {
      necesarias: [consentCookieName],
      marketing: [],
      preferencias: [],
      estadisticas: [],
    };

    // Obtener cookie
    function getCookie(name) {
      return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1];
    }

    // Establecer cookie
    function setCookie(name, value, days) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      document.cookie = `${name}=${value}; path=/; domain=${domainName}; expires=${expirationDate.toUTCString()}`;
    }

    // Eliminar cookie (excepto necesarias)
    function deleteCookie(name) {
      if (!cookiesCategorizadas.necesarias.includes(name)) {
        document.cookie = `${name}=; path=/; domain=${domainName}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      }
    }

    // Mostrar el banner de cookies
    function showCookieBanner() {
      const cookieBanner = document.querySelector(".whoisjoa-cookies");
      cookieBanner.style.display = "flex";
      cookieBanner.style.opacity = "0";
      setTimeout(() => {
        cookieBanner.style.transition = "opacity 0.5s";
        cookieBanner.style.opacity = "1";
      }, 10);
    }

    // Ocultar el banner de cookies con un desvanecimiento
    function hideCookieBanner() {
      const cookieBanner = document.querySelector(".whoisjoa-cookies");
      if (cookieBanner) {
        cookieBanner.style.opacity = "0";
        setTimeout(() => {
          cookieBanner.style.display = "none";
        }, 500);
      }
    }

    // Guardar preferencias de cookies
    function saveCookiePreferences(preferences) {
      setCookie(consentCookieName, JSON.stringify(preferences), 365); // Guardar preferencias en la cookie
      manageCookies(preferences);
    }

    // Gestionar cookies según preferencias
    function manageCookies(preferences) {
      if (!preferences || typeof preferences !== "object") return;

      Object.keys(cookiesCategorizadas).forEach(category => {
        const allowed = preferences[category];
        cookiesCategorizadas[category]?.forEach(cookieName => {
          if (allowed) {
            // Aquí permitirías las cookies opcionales si el sistema lo requiere
          } else {
            deleteCookie(cookieName); // Eliminar cookies no permitidas
          }
        });
      });
    }

    // Manejar acciones del usuario
    function handleAction(action) {
      if (!action) return;

      action = action.toLowerCase();
      let preferences;

      if (action === "acceptall") {
        preferences = {
          necessary: true,
          marketing: true,
          preferencias: true,
          estadisticas: true,
        };
      } else if (action === "rejectoptional") {
        preferences = {
          necessary: true,
          marketing: false,
          preferencias: false,
          estadisticas: false,
        };
      } else if (action === "configure") {
        preferences = {
          necessary: true,
          marketing: checkboxes.marketing.checked,
          preferencias: checkboxes.preferencias.checked,
          estadisticas: checkboxes.estadisticas.checked,
        };
      } else if (action === "show") {
        showCookieBanner(); // Mostrar nuevamente el banner
        return;
      }

      if (preferences) {
        saveCookiePreferences(preferences);
        hideCookieBanner();
      }
    }

    // Inicializar lógica
    const storedPreferences = getCookie(consentCookieName);
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        // Marcar los checkboxes según las preferencias almacenadas
        checkboxes.marketing.checked = parsedPreferences.marketing;
        checkboxes.preferencias.checked = parsedPreferences.preferencias;
        checkboxes.estadisticas.checked = parsedPreferences.estadisticas;

        manageCookies(parsedPreferences);
      } catch (error) {
        // Si ocurre un error al parsear, mostrar el banner
        showCookieBanner();
      }
    } else {
      showCookieBanner();
    }

    // Añadir eventos a los botones del banner
    document.querySelectorAll("[joa-cookie-action]").forEach(button => {
      button.addEventListener("click", () => {
        handleAction(button.getAttribute("joa-cookie-action"));
      });
    });
  });