// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";
import Link, {LinkProps} from "next/link";
import { ReactElement, cloneElement } from "react";

// ActiveLinkProps inherit all the props from Link
interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({children, activeClassName, ...rest}: ActiveLinkProps){
    const { asPath } = useRouter()

    const className = asPath === rest.href ? activeClassName : "";

    return(
        <Link {...rest}>
            {/* cloneElement allow to modify the properties of children */}
            {cloneElement(children, {
                className,
            })}
        </Link>
    );
}