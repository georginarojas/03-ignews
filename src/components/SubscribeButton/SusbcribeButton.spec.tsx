import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { SubscribeButton } from ".";

jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  test("renders correctly", () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])
    render(<SubscribeButton />);
    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  test("redirects user to sign in when not authenticated", () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])
    const signInMocked = mocked(signIn);
    render(<SubscribeButton />);
    // return an element html
    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);
    expect(signInMocked).toHaveBeenCalled();
  });

  test("redirects to post when user already has a subscription", () => {
    const useRouterMocked = mocked(useRouter);

    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@example.com" },
        activeSubscription: "any-subscription",
        expires: "any-expires",
      },
      false,
    ]);

    const pushMock = jest.fn();
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);
    render(<SubscribeButton />);
    // return an element html
    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);
    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
});
