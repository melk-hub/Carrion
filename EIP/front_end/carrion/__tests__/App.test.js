import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import React from 'react';
import App from "../src/App";

test("vérifie que le texte s'affiche correctement", () => {
  render(<App />);
  const textElement = screen.getByRole('heading', { name: /Carrion/i });
  expect(textElement).toBeInTheDocument();
});