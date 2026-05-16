import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Center,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Image,
  Select,
  useColorMode,
  Flex,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Heading,
  HStack,
  Badge,
} from "@chakra-ui/react";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaLayerGroup,
} from "react-icons/fa";
// import LogoPena from "../assets/Logo Pena.png";
import { login } from "../Redux/Reducers/auth";
import { selectIsAuthenticated, selectRole } from "../Redux/Reducers/auth";
import FotoLogin from "../assets/home.png";
import LogoDinkes from "../assets/logo.png";
import LogoPena from "../assets/penaLogo.png";
import LogoAset from "../assets/asetLogo.png";
import LogoPegawai from "../assets/pegawaiLogo.png";
import LogoPerencanaan from "../assets/perencanaanLogo.png";

const LoginPegawai = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const isAuthenticated =
    useSelector(selectIsAuthenticated) || localStorage.getItem("token");
  const roles = useSelector(selectRole);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure();

  const [namaPengguna, setNamaPengguna] = useState("");
  const [password, setPassword] = useState("");
  const [pilihanAplikasi, setPilihanAplikasi] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!namaPengguna || !password) {
      setError("NIP dan password harus diisi.");
      toast({
        title: "Peringatan",
        description: "NIP dan password harus diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(login(namaPengguna, password));

      await new Promise((resolve) => setTimeout(resolve, 100));

      setError("");
      setNamaPengguna("");
      setPassword("");

      toast({
        title: "Login Berhasil",
        description: "Anda berhasil masuk ke sistem.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "NIP atau password salah!";

      setError(errorMsg);
      setErrorMessage(errorMsg);
      onErrorModalOpen();

      toast({
        title: "Login Gagal",
        description: errorMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    history.push("/pegawai/dashboard");
  }

  return (
    <Flex
      minH="100vh"
      w="100%"
      direction={{ base: "column", lg: "row" }}
      bg="gray.50"
      position="relative"
      overflow="hidden"
    >
      {/* Panel Kiri - Branding */}
      <Box
        w={{ base: "100%", lg: "50%" }}
        bgGradient="linear(to-br, red.900, red.800, red.600)"
        p={{ base: 6, lg: 10 }}
        color="white"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative overlay */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.12}
          bgGradient="radial(circle at top left, whiteAlpha.800, transparent 60%)"
        />

        {/* Logo dan nama instansi */}
        <Box position="relative" zIndex={1}>
          <Flex align="center" gap={3}>
            <Box
              h="48px"
              w="48px"
              bg="whiteAlpha.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderWidth="1px"
              borderColor="whiteAlpha.300"
              backdropFilter="blur(8px)"
            >
              <Image
                src={LogoDinkes}
                alt="Logo Dinas Kesehatan"
                boxSize="32px"
                objectFit="contain"
              />
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="lg" lineHeight="short">
                Dinas Kesehatan
              </Text>
              <Text fontSize="sm" color="red.100">
                Kabupaten Paser
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Konten tengah */}
        <Box position="relative" zIndex={1} py={{ base: 10, lg: 0 }}>
          <VStack align="flex-start" spacing={5}>
            <Box
              h="80px"
              w="80px"
              borderRadius="2xl"
              bg="whiteAlpha.200"
              borderWidth="1px"
              borderColor="whiteAlpha.300"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="xl"
              backdropFilter="blur(10px)"
            >
              <Image
                src={FotoLogin}
                alt="Ilustrasi SIPEKA"
                boxSize="60px"
                objectFit="contain"
              />
            </Box>
            <Heading
              as="h1"
              fontSize={{ base: "2.5xl", lg: "3.5xl" }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              SIPEKA
            </Heading>
            <Text
              fontSize={{ base: "lg", lg: "xl" }}
              fontWeight="semibold"
              color="red.50"
            >
              Sistem Penilaian Kinerja Pegawai
            </Text>
            <Text maxW="md" color="red.100" lineHeight="tall" fontSize="sm">
              Platform terintegrasi untuk pengelolaan dan evaluasi kinerja
              pegawai di lingkungan Dinas Kesehatan Kabupaten Paser.
            </Text>
          </VStack>
        </Box>

        {/* Copyright desktop */}
        <Box
          position="relative"
          zIndex={1}
          fontSize="sm"
          color="red.100"
          display={{ base: "none", lg: "block" }}
        >
          &copy; {new Date().getFullYear()} Dinas Kesehatan Kabupaten Paser. All
          rights reserved.
        </Box>
      </Box>

      {/* Panel Kanan - Form Login */}
      <Center
        bg={colorMode === "dark" ? "gray.900" : "white"}
        w={{ base: "100%", lg: "50%" }}
        p={{ base: 6, md: 10 }}
      >
        <Box
          w="100%"
          maxW="460px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="2xl"
          boxShadow="2xl"
          p={{ base: 6, md: 8 }}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            bgGradient:
              "linear-gradient(90deg, rgba(220, 38, 38, 1) 0%, rgba(248, 113, 113, 1) 100%)",
            borderRadius: "2xl 2xl 0 0",
          }}
        >
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <VStack align="flex-start" spacing={1}>
              <Heading
                as="h2"
                fontSize="2xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Selamat Datang
              </Heading>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                Masuk ke akun Anda untuk melanjutkan.
              </Text>
            </VStack>

            <Divider
              borderColor={colorMode === "dark" ? "gray.700" : "gray.100"}
            />

            {/* Form Input */}
            <Box as="form" onSubmit={handleSubmit} noValidate>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight={600}
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <FaUser size="14px" />
                    NIP / Username
                  </FormLabel>
                  <Input
                    value={namaPengguna}
                    onChange={(e) => setNamaPengguna(e.target.value)}
                    height="50px"
                    placeholder="Masukkan NIP atau username"
                    size="lg"
                    borderRadius="lg"
                    borderColor={
                      colorMode === "dark" ? "gray.600" : "gray.300"
                    }
                    _hover={{ borderColor: "red.400" }}
                    _focus={{
                      borderColor: "red.500",
                      boxShadow: "0 0 0 1px rgba(248, 113, 113, 0.5)",
                    }}
                    transition="all 0.2s"
                    bg={colorMode === "dark" ? "gray.900" : "white"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight={600}
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <FaLock size="14px" />
                    Kata Sandi
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      height="50px"
                      type={showPassword ? "text" : "password"}
                      pr="50px"
                      borderRadius="lg"
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      _hover={{ borderColor: "red.400" }}
                      _focus={{
                        borderColor: "red.500",
                        boxShadow: "0 0 0 1px rgba(248, 113, 113, 0.5)",
                      }}
                      transition="all 0.2s"
                      bg={colorMode === "dark" ? "gray.900" : "white"}
                    />
                    <InputRightElement height="50px" width="50px">
                      <IconButton
                        aria-label={
                          showPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                        _hover={{ bg: "gray.100", color: "red.500" }}
                        color="gray.500"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Flex justify="flex-end">
                  <Text
                    as="button"
                    type="button"
                    fontSize="xs"
                    fontWeight="medium"
                    color="red.500"
                    _hover={{
                      color: "red.400",
                      textDecoration: "underline",
                    }}
                    bg="transparent"
                  >
                    Lupa kata sandi?
                  </Text>
                </Flex>

                {error && (
                  <Alert
                    status="error"
                    borderRadius="lg"
                    variant="left-accent"
                    fontSize="sm"
                  >
                    <AlertIcon />
                    <Text fontSize="sm" fontWeight={500}>
                      {error}
                    </Text>
                  </Alert>
                )}

                <Button
                  mt={2}
                  w="100%"
                  type="submit"
                  variant="primary"
                  size="lg"
                  height="50px"
                  fontSize="sm"
                  fontWeight={600}
                  isLoading={isLoading}
                  loadingText="Memproses..."
                  isDisabled={isLoading}
                  borderRadius="lg"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "md",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                >
                  Masuk ke Aplikasi
                </Button>
              </VStack>
            </Box>

            {/* Copyright mobile */}
            <Box
              mt={2}
              textAlign="center"
              fontSize="xs"
              color="gray.500"
              display={{ base: "block", lg: "none" }}
            >
              &copy; {new Date().getFullYear()} Dinas Kesehatan Kabupaten Paser
            </Box>
          </VStack>
        </Box>
      </Center>
      {/* Modal Error Login */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={onErrorModalClose}
        isCentered
        size="md"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader
            color="red.500"
            fontSize="xl"
            fontWeight={700}
            bg="red.50"
            borderBottom="1px solid"
            borderColor="red.100"
          >
            Login Gagal
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Alert
              status="error"
              borderRadius="lg"
              mb={4}
              variant="left-accent"
            >
              <AlertIcon />
              <Text fontSize="md" fontWeight={600}>
                {errorMessage ||
                  "Terjadi kesalahan saat melakukan login. Silakan coba lagi."}
              </Text>
            </Alert>
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">
              Pastikan NIP dan password yang Anda masukkan sudah benar. Jika
              masalah masih berlanjut, silakan hubungi administrator.
            </Text>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button
              colorScheme="red"
              onClick={onErrorModalClose}
              w="100%"
              size="md"
              borderRadius="lg"
              fontWeight={600}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
              transition="all 0.2s"
            >
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default LoginPegawai;
