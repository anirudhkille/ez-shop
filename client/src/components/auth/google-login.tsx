import { Button } from "../ui/button";

export default function GoogleLogin() {
  const handleGoogleLogin = () => {
    window.location.href = import.meta.env.VITE_API_BASE_URL + "/user/google";
  };
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleGoogleLogin}
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}
