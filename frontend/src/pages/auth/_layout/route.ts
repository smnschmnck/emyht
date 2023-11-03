import { Route, redirect } from "@tanstack/react-router";
import { AuthLayout } from "./AuthLayout";
import { mainLayoutRoute } from "@/pages/_mainLayout/route";
import { getUserData } from "@/api/userApi";
import { HttpError } from "@/errors/httpError/httpError";

export const authLayoutRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  id: "authLayoutRoute",
  component: AuthLayout,
  beforeLoad: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.statusCode === 401) {
          return {
            hasError: false,
            errorMessage: "",
          };
        }
      }

      if (e instanceof Error) {
        return {
          hasError: true,
          errorMessage: e.message,
        };
      }
      return {
        hasError: true,
        errorMessage: String(e),
      };
    }
    if (userData.emailActive) {
      throw redirect({ to: "/" });
    }

    if (!userData.emailActive) {
      throw redirect({ to: "/no-email" });
    }

    return {
      hasError: false,
      errorMessage: "",
    };
  },
});
