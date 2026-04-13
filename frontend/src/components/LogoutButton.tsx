export default function LogoutButton() {

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return undefined;
    };

    const handleLogout = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 6000);
      const csrftoken = getCookie("csrftoken");

      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/logout/`, {
          method: "POST",
          credentials: "include",
          headers: csrftoken ? { "X-CSRFToken": csrftoken } : undefined,
          signal: controller.signal,
        });
      } catch (err) {
        console.error(err);
      } finally {
        window.clearTimeout(timeoutId);
      }
  
      localStorage.removeItem("user");
      window.location.href = "/login";
    };
  
    return (
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    );
  }