import React, { useState, useEffect } from "react";
import { Flex, Heading, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList} from '@chakra-ui/react';
import { Link } from "react-router-dom";
import styled from "styled-components";
import { HamburgerIcon, CloseIcon} from "@chakra-ui/icons";
import { CgProfile } from "react-icons/cg";
import { FaHome } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi2";
import { FiStar } from "react-icons/fi";
import { navigateTo } from "../utils";

const StyledLink = styled(Link)`
  color: #B4D330;
  font-size: 1.1rem;
  margin-right: 1.1rem;
  margin-left: 1.1rem;
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const NavItem = ({ href, icon, children }) => {
  return (
    <Flex as="li">
      <StyledLink to={href} className="flex items-center gap-1 hover:text-neutral-400 transition-all">
        {icon}
        {children}
      </StyledLink>
    </Flex>
  );
};

const MobileMenu = ({isOpen, toggleMenu, menuItems}) => (
  <Menu>
    <MenuButton as={IconButton} icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>} onClick={toggleMenu} variant="outline" boxSize={25} color="#B4D330" backgroundColor="transparent" border="none"/>
    <MenuList>
      {menuItems.map((item, index) => (
        <MenuItem key={index} onClick={() => navigateTo(item.path)} padding="1rem" color="#B4D330" border="none" backgroundColor="#022831" icon={item.icon}>
          {item.text}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

export function LoginHeader(){
  return (
    <Flex align="center" justify="space-between" p={4} bg="#022831">
      <Heading ml="1rem" as="h1" size="lg" color="#B4D330">TravelMate</Heading>
    </Flex>
  );
}

export function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 743);
  const [isOpen, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!isOpen);
  };

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 743);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return() => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const menuItems = [
    { path: "/dashboard", text: "Profile", icon: <CgProfile /> },
    { path: "/dashboard", text: "Home", icon: <FaHome /> },
    { path: "/groups", text: "Groups", icon: <HiUserGroup /> },
    { path: "/dashboard", text: "Recommendations", icon: <FiStar /> }
  ];

  return (
    <Flex align="center" justify="space-between" padding="1rem" bg="#022831" marginTop="1rem">
      <Heading ml="1rem" as="h1" size="lg" color="#B4D330">TravelMate</Heading>
      {isMobile ? (
        <MobileMenu isOpen={isOpen} toggleMenu={toggleMenu} menuItems={menuItems} />
      ) : (
        <Flex marginRight="1 rem" as="ul" className="hidden lg:flex lg:items-center gap-5 text-sm">
          <NavItem href="/login" icon={<CgProfile />}>
            Profile
          </NavItem>
          <NavItem href="/dashboard" icon={<FaHome />}>
            Home
          </NavItem>
          <NavItem href="/groups" icon={<HiUserGroup/>}>
            Groups
          </NavItem>
          <NavItem href="#" icon={<FiStar/>}>
            Recommendations
          </NavItem>
        </Flex>
      )}
    </Flex>
  );
}