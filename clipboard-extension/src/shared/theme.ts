import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  radius: {
    md: "0.5rem",
    xl: "1rem",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
