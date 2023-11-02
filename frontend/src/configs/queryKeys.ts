import { getUserData } from "@/api/userApi";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const queryKeys = createQueryKeyStore({
  users: {
    details: {
      queryKey: ["userDetails"],
      queryFn: getUserData,
    },
  },
});
