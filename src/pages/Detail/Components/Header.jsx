import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiInfo, FiChevronRight, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";

function Header({ detailPerjalanan, adaStatusDuaAtauTiga, onEditClick, penomoran, keuangan }) {
  // Tentukan status berdasarkan statusId personil
  const getStatusLabel = () => {
    const statusIds = detailPerjalanan?.personils?.map((p) => p.statusId) || [];
    if (statusIds.includes(3)) return "Selesai";
    if (statusIds.includes(2)) return "Disetujui";
    return "Diproses";
  };

  const getStatusColor = () => {
    const statusIds = detailPerjalanan?.personils?.map((p) => p.statusId) || [];
    if (statusIds.includes(3)) return "green";
    if (statusIds.includes(2)) return "green";
    return "green";
  };

  // Tentukan status penomoran
  const getPenomoranStatus = () => {
    if (!penomoran) return null;
    const isAktif = penomoran === "aktif" || penomoran === true;
    return {
      label: isAktif ? "Penomoran Aktif" : "Penomoran Nonaktif",
      bg: isAktif ? "blue.100" : "gray.100",
      color: isAktif ? "blue.700" : "gray.700",
      borderColor: isAktif ? "blue.200" : "gray.200",
    };
  };

  // Tentukan status keuangan
  const getKeuanganStatus = () => {
    if (!keuangan) return null;
    const isAktif = keuangan === "aktif" || keuangan === true;
    return {
      label: isAktif ? "Keuangan Aktif" : "Keuangan Nonaktif",
      bg: isAktif ? "green.100" : "gray.100",
      color: isAktif ? "green.700" : "gray.700",
      borderColor: isAktif ? "green.200" : "gray.200",
    };
  };

  const penomoranStatus = getPenomoranStatus();
  const keuanganStatus = getKeuanganStatus();

  return (
    <Box
      py={8}
      mb={8}
    >
      <Container
        maxW={{ base: "100%", md: "1280px", lg: "1380px" }}
        px={{ base: 4, sm: 6, lg: 8 }}
      >
        <VStack align="stretch" spacing={4}>
        {/* Breadcrumbs */}
        <HStack
          spacing={2}
          fontSize="sm"
          color="gray.500"
          mb={4}
          overflowX="auto"
          pb={1}
        >
          <Button
            as={Link}
            to="/perjalanan"
            variant="ghost"
            size="xs"
            p={1}
            minW="auto"
            h="auto"
            _hover={{
              color: "teal.600",
              bg: "gray.100",
            }}
            borderRadius="md"
            transition="colors 0.2s"
          >
            <Icon as={FiHome} boxSize={3.5} />
          </Button>
          <Icon as={FiChevronRight} boxSize={3} color="gray.300" />
          <Button
            as={Link}
            to="/perjalanan"
            variant="ghost"
            size="xs"
            p={1}
            minW="auto"
            h="auto"
            whiteSpace="nowrap"
            _hover={{
              color: "teal.600",
              bg: "gray.100",
            }}
            borderRadius="md"
            transition="colors 0.2s"
          >
            Perjalanan Dinas
          </Button>
          <Icon as={FiChevronRight} boxSize={3} color="gray.300" />
          <Badge
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="md"
            bg="gray.100"
            color="gray.900"
            fontWeight="medium"
          >
            Detail Perjalanan
          </Badge>
        </HStack>

        {/* Title and Status */}
        <Flex
          align={{ base: "start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={4}
          flexWrap="wrap"
        >
          <HStack spacing={4} align="start" flexWrap="wrap">
            <Box
              p={3}
              bg="white"
              borderRadius="xl"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              display={{ base: "none", sm: "flex" }}
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiInfo} boxSize={6} color="teal.600" />
            </Box>
            <VStack align="start" spacing={1}>
              <HStack spacing={3} mb={1} flexWrap="wrap">
                <Heading
                  size={{ base: "lg", sm: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="gray.900"
                  letterSpacing="tight"
                >
                  Detail Perjalanan Dinas
                </Heading>
                <Badge
                  bg="green.100"
                  color="green.700"
                  fontSize="xs"
                  fontWeight="bold"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  border="1px"
                  borderColor="green.200"
                  shadow="sm"
                >
                  {getStatusLabel()}
                </Badge>
                {penomoranStatus && (
                  <Badge
                    bg={penomoranStatus.bg}
                    color={penomoranStatus.color}
                    fontSize="xs"
                    fontWeight="bold"
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    border="1px"
                    borderColor={penomoranStatus.borderColor}
                    shadow="sm"
                  >
                    {penomoranStatus.label}
                  </Badge>
                )}
                {keuanganStatus && (
                  <Badge
                    bg={keuanganStatus.bg}
                    color={keuanganStatus.color}
                    fontSize="xs"
                    fontWeight="bold"
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    border="1px"
                    borderColor={keuanganStatus.borderColor}
                    shadow="sm"
                  >
                    {keuanganStatus.label}
                  </Badge>
                )}
              </HStack>
              <Text
                fontSize={{ base: "sm", sm: "base" }}
                color="gray.500"
                maxW="2xl"
              >
                Informasi lengkap perjalanan dinas dan personil terkait untuk
                keperluan administrasi.
              </Text>
            </VStack>
          </HStack>

          <Button
            px={4}
            py={2}
            bg="white"
            border="1px"
            borderColor="gray.200"
            color="gray.600"
            fontSize="sm"
            fontWeight="medium"
            borderRadius="lg"
            _hover={{
              bg: "gray.50",
              color: "gray.900",
            }}
            transition="colors 0.2s"
            shadow="sm"
            onClick={() => window.history.back()}
          >
            Kembali
          </Button>
        </Flex>

        {/* Divider */}
        <Box
          h="1px"
          bgGradient="linear(to-r, transparent, gray.200, transparent)"
          mt={8}
          w="100%"
        />
        </VStack>
      </Container>
    </Box>
  );
}

export default Header;
