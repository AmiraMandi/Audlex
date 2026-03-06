import { permanentRedirect } from "next/navigation";

export default function RegistroPage() {
  permanentRedirect("/auth/registro");
}
