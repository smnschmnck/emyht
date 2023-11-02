import { env } from "@/env";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const queryKeys = createQueryKeyStore({
  users: {
    details: {
      queryKey: ["userDetails"],
      queryFn: async () => {
        const res = await fetch(`${env.VITE_BACKEND_HOST}/user`);
        if (!res.ok) {
          throw new Error(await res.text());
        }

        return await res.json();
      },
    },
  },
});
