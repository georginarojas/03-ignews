import { render } from "@testing-library/react";
import { useRouter } from "next/router";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  test("renders correctly", () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );
    expect(getByText('Home')).toBeInTheDocument()
  });
  
  it("receiving active class", () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );
    expect(getByText('Home')).toHaveClass('active')
  });
  
})
