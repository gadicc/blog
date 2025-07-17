"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    mode: "light",
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: "2.125rem",
      fontWeight: 500,
    },
    /*
    mui bug?  these don't work
    h2: {
      fontSize: "1.5rem",
      fontWeight: 400,
      color: "red",
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 200,
      color: "red",
    },
    */
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "info" && {
            backgroundColor: "#60a5fa",
          }),
        }),
      },
    },
  },
});

export default theme;
