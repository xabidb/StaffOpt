import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import Login from '../views/Login';

test('renders Login page title and fields', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  
  // Check that the title renders
  const titleElement = screen.getByText(/StaffOpt Portal/i);
  expect(titleElement).toBeInTheDocument();
  
  // Check input labels render
  const emailLabel = screen.getByText(/Email Address/i);
  const passwordLabel = screen.getByText(/Password/i);
  expect(emailLabel).toBeInTheDocument();
  expect(passwordLabel).toBeInTheDocument();
});
