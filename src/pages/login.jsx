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

const Login = () => {
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
    setError(""); // Reset error sebelumnya

    if (!pilihanAplikasi) {
      setError("Silakan pilih aplikasi terlebih dahulu.");
      toast({
        title: "Peringatan",
        description: "Silakan pilih aplikasi terlebih dahulu.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

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

      // Reset form setelah login berhasil
      setError("");
      setNamaPengguna("");
      setPassword("");

      // Tampilkan toast sukses
      toast({
        title: "Login Berhasil",
        description: "Anda berhasil masuk ke sistem.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      if (pilihanAplikasi === "pegawai") {
        history.push("/pegawai/dashboard");
      } else if (pilihanAplikasi === "aset") {
        history.push("/aset/dashboard");
      } else if (pilihanAplikasi === "pena") {
        history.push("/");
      } else if (pilihanAplikasi === "perencanaan") {
        history.push("/perencanaan");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Ambil pesan error dari response jika ada
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "NIP atau password salah!";

      setError(errorMsg);
      setErrorMessage(errorMsg);

      // Buka modal error
      onErrorModalOpen();

      // Tampilkan toast error (opsional, bisa dihapus jika hanya ingin modal)
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
    let currentRoles = roles || JSON.parse(localStorage.getItem("role"));

    if (
      Array.isArray(currentRoles) &&
      currentRoles.length === 1 &&
      (currentRoles[0].roleId === 9 || currentRoles[0].id === 9)
    ) {
      history.push("/pegawai/dashboard");
    } else if (
      Array.isArray(currentRoles) &&
      currentRoles.length === 1 &&
      (currentRoles[0].roleId === 10 || currentRoles[0].id === 10)
    ) {
      history.push("/aset/dashboard");
    } else {
      history.push("/");
    }
  }

  return (
    <Flex minH="100vh" position="relative" overflow="hidden">
      {/* Bagian Gambar */}
      <Box
        w={{ base: "0%", md: "50%" }}
        display={{ base: "none", md: "block" }}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        }}
      >
        <Image
          h="100vh"
          w="100%"
          objectFit="cover"
          src={FotoLogin}
          alt="Background Login"
        />
      </Box>

      {/* Bagian Form Login */}
      <Center
        bgGradient="linear-gradient(135deg, rgba(55, 176, 134, 1) 0%, rgba(19, 122, 106, 1) 100%)"
        height="100vh"
        w={{ base: "100%", md: "50%" }}
        position="relative"
        p={{ base: 4, md: 8 }}
      >
        <Box
          w="100%"
          maxW="600px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
          boxShadow="2xl"
          p={{ base: 6, md: 10 }}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            bgGradient:
              "linear-gradient(90deg, rgba(55, 176, 134, 1) 0%, rgba(19, 122, 106, 1) 100%)",
            borderRadius: "xl xl 0 0",
          }}
        >
          <VStack spacing={6} align="stretch">
            {/* Header dengan Logo */}
            <VStack spacing={4} mb={2}>
              <Flex align="center" gap={4} flexWrap="wrap" justify="center">
                <Image
                  height="90px"
                  objectFit="contain"
                  src={LogoDinkes}
                  alt="Logo Dinkes"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "scale(1.05)" }}
                />
                <Box textAlign={{ base: "center", md: "left" }}>
                  <Heading
                    as="h1"
                    size={{ base: "md", md: "lg" }}
                    color="rgba(35, 178, 196, 1)"
                    fontWeight={900}
                    lineHeight="1.2"
                  >
                    DINAS KESEHATAN
                  </Heading>
                  <Text
                    fontSize={{ base: "18px", md: "22px" }}
                    fontWeight={700}
                    color="gray.700"
                    mt={1}
                  >
                    KABUPATEN PASER
                  </Text>
                </Box>
              </Flex>
              <Divider borderColor="gray.200" />
            </VStack>

            {/* Logo Aplikasi */}
            <Box>
              <Text
                fontSize="sm"
                fontWeight={600}
                color="gray.600"
                mb={3}
                textAlign="center"
              >
                Pilih Aplikasi
              </Text>
              <HStack spacing={4} justify="center" flexWrap="wrap" gap={3}>
                <Box
                  as="button"
                  onClick={() => setPilihanAplikasi("pena")}
                  p={3}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={
                    pilihanAplikasi === "pena" ? "teal.500" : "gray.200"
                  }
                  bg={pilihanAplikasi === "pena" ? "teal.50" : "transparent"}
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: "teal.500",
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  cursor="pointer"
                >
                  <Image
                    height="35px"
                    objectFit="contain"
                    src={LogoPena}
                    alt="Pena"
                  />
                </Box>
                <Box
                  as="button"
                  onClick={() => setPilihanAplikasi("pegawai")}
                  p={3}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={
                    pilihanAplikasi === "pegawai" ? "teal.500" : "gray.200"
                  }
                  bg={pilihanAplikasi === "pegawai" ? "teal.50" : "transparent"}
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: "teal.500",
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  cursor="pointer"
                >
                  <Image
                    height="35px"
                    objectFit="contain"
                    src={LogoPegawai}
                    alt="Pegawai"
                  />
                </Box>
                <Box
                  as="button"
                  onClick={() => setPilihanAplikasi("aset")}
                  p={3}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={
                    pilihanAplikasi === "aset" ? "teal.500" : "gray.200"
                  }
                  bg={pilihanAplikasi === "aset" ? "teal.50" : "transparent"}
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: "teal.500",
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  cursor="pointer"
                >
                  <Image
                    height="35px"
                    objectFit="contain"
                    src={LogoAset}
                    alt="Aset"
                  />
                </Box>
                <Box
                  as="button"
                  onClick={() => setPilihanAplikasi("perencanaan")}
                  p={3}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={
                    pilihanAplikasi === "perencanaan" ? "teal.500" : "gray.200"
                  }
                  bg={
                    pilihanAplikasi === "perencanaan"
                      ? "teal.50"
                      : "transparent"
                  }
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: "teal.500",
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  cursor="pointer"
                >
                  <Image
                    height="35px"
                    objectFit="contain"
                    src={LogoPerencanaan}
                    alt="Perencanaan"
                  />
                </Box>
              </HStack>
              {pilihanAplikasi && (
                <Badge
                  colorScheme="teal"
                  mt={2}
                  display="block"
                  textAlign="center"
                  p={1}
                  borderRadius="md"
                >
                  {pilihanAplikasi === "pegawai" && "Kepegawaian"}
                  {pilihanAplikasi === "aset" && "Aset"}
                  {pilihanAplikasi === "pena" && "Pena"}
                  {pilihanAplikasi === "perencanaan" && "Perencanaan"}
                </Badge>
              )}
            </Box>

            {/* Form Input */}
            <VStack spacing={5} align="stretch" mt={4}>
              <FormControl>
                <FormLabel
                  fontSize="md"
                  fontWeight={600}
                  color="gray.700"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaUser size="14px" />
                  Akun Pengguna
                </FormLabel>
                <Input
                  value={namaPengguna}
                  onChange={(e) => setNamaPengguna(e.target.value)}
                  height="50px"
                  placeholder="Masukkan NIP"
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px rgba(55, 176, 134, 0.3)",
                  }}
                  transition="all 0.2s"
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="md"
                  fontWeight={600}
                  color="gray.700"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaLock size="14px" />
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    height="50px"
                    type={showPassword ? "text" : "password"}
                    pr="50px"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: "teal.400" }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px rgba(55, 176, 134, 0.3)",
                    }}
                    transition="all 0.2s"
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
                      _hover={{ bg: "gray.100", color: "teal.500" }}
                      color="gray.500"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="md"
                  fontWeight={600}
                  color="gray.700"
                  mb={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FaLayerGroup size="14px" />
                  Pilih Aplikasi
                </FormLabel>
                <Select
                  placeholder="Pilih aplikasi yang ingin digunakan"
                  value={pilihanAplikasi}
                  onChange={(e) => setPilihanAplikasi(e.target.value)}
                  height="50px"
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px rgba(55, 176, 134, 0.3)",
                  }}
                  transition="all 0.2s"
                >
                  <option value="pegawai">Kepegawaian</option>
                  <option value="aset">Aset</option>
                  <option value="pena">Pena</option>
                  <option value="perencanaan">Perencanaan</option>
                </Select>
              </FormControl>

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
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                height="50px"
                fontSize="md"
                fontWeight={600}
                isLoading={isLoading}
                loadingText="Memproses..."
                isDisabled={isLoading}
                borderRadius="lg"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
                Masuk
              </Button>
            </VStack>
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

export default Login;
