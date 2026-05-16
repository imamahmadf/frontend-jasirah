import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/Reducers/auth"; // Import action creator
import { Route, Redirect, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Box,
  Center,
  Text,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Input,
  useToast,
  Badge,
  VStack,
  Divider,
  Spacer,
  Image,
  useDisclosure,
  useColorMode,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  IconButton,
  Tooltip,
  Link,
} from "@chakra-ui/react";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import Layout from "../../Componets/Layout";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaBuilding,
  FaCalendarAlt,
  FaFileAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaEdit,
  FaTrash,
  FaShieldAlt,
  FaCertificate,
  FaFileContract,
  FaFileInvoiceDollar,
  FaUserGraduate,
  FaFileSignature,
  FaMap,
  FaStethoscope,
  FaUserTie,
} from "react-icons/fa";

function DetailNaikJenjang(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [dataUsulan, setDataUsulan] = useState(null);
  const [isModalBatalOpen, setIsModalBatalOpen] = useState(false);
  const [catatan, setCatatan] = useState(null);
  const [tanggalTMT, setTanggalTMT] = useState("");
  const [link, setLink] = useState("");
  const user = useSelector(userRedux);

  function inputHandler(event, field) {
    const tes = setTimeout(() => {
      const { value } = event.target;
      setLink(value);
    }, 2000);
  }

  async function fetchDataUsulan() {
    setIsLoading(true); // Set loading true sebelum fetch
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/naik-jenjang/get/detail/${props.match.params.id}`
      )
      .then((res) => {
        setDataUsulan(res.data.result);
        console.log(res.data.result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }

  const kirimLink = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/naik-jenjang/update/link-sertifikat`,
        {
          linkSertifikat: link,
          id: dataUsulan.id,
          pangkatId: parseInt(dataUsulan?.pegawai?.daftarPangkat?.id) + 1,
          golonganId: parseInt(dataUsulan?.pegawai?.daftarGolongan?.id) + 1,
          pegawaiId: dataUsulan?.pegawai?.id,
          tanggalTMT,
          unitKerjaLamaId: dataUsulan?.pegawai?.daftarUnitKerja?.id,
          profesiLamaId: dataUsulan?.pegawai?.profesi.id,
        }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataUsulan();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const ubahStatus = (val, stat) => {
    console.log(val, stat, "cek ubah status");
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/naik-jenjang/update/status`,
        { id: dataUsulan.id, catatan, status: stat }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataUsulan();
        setIsModalBatalOpen(false);
        setCatatan(null);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handlePreview = (fileName) => {
    if (!fileName) return;
    const url = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${fileName}`;
    window.open(url, "_blank");
  };

  const handleLinkClick = (link) => {
    if (!link) return;
    // Pastikan link dimulai dengan http atau https
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

  const isFileAvailable = (fileName) => {
    return (
      fileName &&
      fileName.trim() !== "" &&
      fileName !== "null" &&
      fileName !== "undefined"
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "diusulkan":
        return "orange";
      case "diterima":
        return "green";
      case "ditolak":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "diusulkan":
        return "Menunggu Verifikasi";
      case "diterima":
        return "Diterima";
      case "ditolak":
        return "Ditolak";
      default:
        return "Tidak Diketahui";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "diusulkan":
        return FaClock;
      case "diterima":
        return FaCheckCircle;
      case "ditolak":
        return FaTimesCircle;
      default:
        return FaClock;
    }
  };

  useEffect(() => {
    // Jalankan kedua fetch dan set loading false setelah keduanya selesai
    fetchDataUsulan();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <LayoutPegawai>
      <Box bgGradient="linear(to-br, blue.50, purple.50)" py={8}>
        <Container maxW="7xl" px={4}>
          {/* Header Section */}
          <Card
            my={8}
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            borderRadius="xl"
          >
            <CardBody p={8}>
              <Flex direction={{ base: "column", lg: "row" }} gap={6}>
                {/* Profile Info */}
                <Flex flex={1} gap={4} align="center">
                  <Avatar
                    size="xl"
                    name={dataUsulan?.pegawai?.nama}
                    bg="blue.500"
                    color="white"
                    icon={<FaUser />}
                  />
                  <Box>
                    <Heading size="lg" color="gray.800" mb={2}>
                      {dataUsulan?.pegawai?.nama}
                    </Heading>
                    <Text
                      fontSize="lg"
                      color="blue.600"
                      fontWeight="semibold"
                      mb={1}
                    >
                      {dataUsulan?.pegawai?.jabatan}
                    </Text>
                    <HStack spacing={4} color="gray.600" fontSize="sm">
                      <HStack>
                        <Icon as={FaIdCard} />
                        <Text>{dataUsulan?.pegawai?.nip}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaShieldAlt} />
                        <Text>
                          {dataUsulan?.pegawai?.daftarPangkat.pangkat}/
                          {dataUsulan?.pegawai?.daftarGolongan.golongan}
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack spacing={4} color="gray.600" fontSize="sm" mt={2}>
                      <HStack>
                        <Icon as={FaBuilding} />
                        <Text>
                          {dataUsulan?.pegawai?.daftarUnitKerja.unitKerja}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaCalendarAlt} />
                        <Text>{dataUsulan?.pegawai?.tanggalTMT}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Flex>

                {/* Status Section */}
                <Box textAlign={{ base: "left", lg: "right" }}>
                  <VStack spacing={3}>
                    <Badge
                      size="lg"
                      colorScheme={getStatusColor(dataUsulan?.status)}
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                    >
                      <HStack spacing={2}>
                        <Icon as={getStatusIcon(dataUsulan?.status)} />
                        <Text>{getStatusText(dataUsulan?.status)}</Text>
                      </HStack>
                    </Badge>

                    {dataUsulan?.catatan && (
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="gray.200"
                        maxW="300px"
                      >
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Catatan:
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {dataUsulan?.catatan}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Documents Section */}
          <Card
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            borderRadius="xl"
          >
            <CardHeader bg="gray.50" borderTopRadius="xl">
              <Heading size="md" color="gray.800">
                📋 Dokumen Usulan
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Kelengkapan dokumen yang diperlukan untuk verifikasi
              </Text>
            </CardHeader>
            <CardBody p={8}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Left Column */}
                <VStack spacing={4} align="stretch">
                  <DocumentItem
                    title="Formulir Pengusulan"
                    icon={FaFileAlt}
                    onPreview={() => handlePreview(dataUsulan.formulir)}
                    color="blue"
                    isAvailable={isFileAvailable(dataUsulan.formulir)}
                  />
                  <DocumentItem
                    title="UKOM"
                    icon={FaCertificate}
                    onPreview={() => handlePreview(dataUsulan.ukom)}
                    color="green"
                    isAvailable={isFileAvailable(dataUsulan.ukom)}
                  />
                  <DocumentItem
                    title="SK Pangkat"
                    icon={FaFileContract}
                    onPreview={() => handlePreview(dataUsulan.SKPangkat)}
                    color="purple"
                    isAvailable={isFileAvailable(dataUsulan.SKPangkat)}
                  />
                  <DocumentItem
                    title="SK Mutasi"
                    icon={FaFileSignature}
                    onPreview={() => handlePreview(dataUsulan.SKMutasi)}
                    color="teal"
                    isAvailable={isFileAvailable(dataUsulan.SKMutasi)}
                  />
                  <DocumentItem
                    title="SK Jafung"
                    icon={FaGraduationCap}
                    onPreview={() => handlePreview(dataUsulan.SKJafung)}
                    color="cyan"
                    isAvailable={isFileAvailable(dataUsulan.SKJafung)}
                  />
                  <DocumentItem
                    title="SKP"
                    icon={FaFileAlt}
                    onPreview={() => handlePreview(dataUsulan.SKP)}
                    color="pink"
                    isAvailable={isFileAvailable(dataUsulan.SKP)}
                  />
                </VStack>

                {/* Right Column */}
                <VStack spacing={4} align="stretch">
                  <DocumentItem
                    title="STR"
                    icon={FaCertificate}
                    onPreview={() => handlePreview(dataUsulan.STR)}
                    color="indigo"
                    isAvailable={isFileAvailable(dataUsulan.STR)}
                  />
                  <DocumentItem
                    title="SIP"
                    icon={FaStethoscope}
                    onPreview={() => handlePreview(dataUsulan.SIP)}
                    color="red"
                    isAvailable={isFileAvailable(dataUsulan.SIP)}
                  />
                  <DocumentItem
                    title="Rekomendasi"
                    icon={FaUserTie}
                    onPreview={() => handlePreview(dataUsulan.rekom)}
                    color="yellow"
                    isAvailable={isFileAvailable(dataUsulan.rekom)}
                  />
                  <DocumentItem
                    title="Peta Jabatan"
                    icon={FaMap}
                    onPreview={() => handlePreview(dataUsulan.petaJabatan)}
                    color="orange"
                    isAvailable={isFileAvailable(dataUsulan.petaJabatan)}
                  />
                </VStack>
              </SimpleGrid>

              {/* Action Buttons */}
              {dataUsulan?.status === "diusulkan" && (
                <Box mt={8} pt={6} borderTop="1px" borderColor="gray.200">
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    gap={4}
                    justify="center"
                  >
                    <Button
                      leftIcon={<FaCheckCircle />}
                      colorScheme="green"
                      size="lg"
                      px={8}
                      onClick={() => ubahStatus(dataUsulan.id, "diterima")}
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                      transition="all 0.2s"
                    >
                      Verifikasi Usulan
                    </Button>
                    <Button
                      leftIcon={<FaTimesCircle />}
                      colorScheme="red"
                      variant="outline"
                      size="lg"
                      px={8}
                      onClick={() => setIsModalBatalOpen(true)}
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                      transition="all 0.2s"
                    >
                      Tolak Usulan
                    </Button>
                  </Flex>
                </Box>
              )}

              {dataUsulan.status === "diterima" &&
                (dataUsulan.linkSertifikat ? (
                  <Box mt={4}>
                    <Text fontSize="16px" fontWeight="semibold" mb={2}>
                      Link Sertifikat:
                    </Text>
                    <Button
                      onClick={() => handleLinkClick(dataUsulan.linkSertifikat)}
                      variant="link"
                      color="blue.500"
                      textDecoration="underline"
                      maxW="100%"
                      wordBreak="break-all"
                      textAlign="left"
                      justifyContent="flex-start"
                      p={2}
                      borderRadius="md"
                      _hover={{ color: "blue.700", bg: "blue.50" }}
                      transition="all 0.2s"
                      h="auto"
                      whiteSpace="normal"
                    >
                      {dataUsulan.linkSertifikat}
                    </Button>
                  </Box>
                ) : (
                  <Flex gap={5} mt="30px" align="end">
                    <FormControl>
                      <FormLabel fontSize="20px">Link Sertifikat</FormLabel>
                      <Input
                        height="40px"
                        onChange={inputHandler}
                        placeholder="isi dengan link google drive"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="20px">Tanggal TMT</FormLabel>
                      <Input
                        height="40px"
                        type="date"
                        onChange={(e) => {
                          setTanggalTMT(e.target.value);
                        }}
                        placeholder="isi dengan link google drive"
                      />
                    </FormControl>
                    <Button
                      onClick={kirimLink}
                      w="150px"
                      variant="primary"
                      alignSelf="end"
                    >
                      Kirim
                    </Button>
                  </Flex>
                ))}
            </CardBody>
          </Card>
        </Container>
      </Box>

      {/* Modal Pembatalan */}
      <Modal
        isOpen={isModalBatalOpen}
        onClose={() => setIsModalBatalOpen(false)}
        size="lg"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader color="red.600">
            <HStack>
              <Icon as={FaTimesCircle} />
              <Text>Alasan Penolakan Usulan</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color="gray.600" fontSize="sm">
                Berikan alasan yang jelas mengapa usulan ini ditolak. Alasan ini
                akan dikirimkan kepada pegawai yang bersangkutan.
              </Text>
              <Textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Masukkan alasan penolakan usulan..."
                size="lg"
                rows={4}
                borderColor="gray.300"
                _focus={{
                  borderColor: "red.400",
                  boxShadow: "0 0 0 1px red.400",
                }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              onClick={() => setIsModalBatalOpen(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FaTimesCircle />}
              onClick={() => ubahStatus(dataUsulan.id, "ditolak")}
              isDisabled={!catatan || catatan.trim() === ""}
            >
              Tolak Usulan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

// Component untuk item dokumen
const DocumentItem = ({ title, icon, onPreview, color, isAvailable }) => (
  <Card
    border="1px"
    borderColor={isAvailable ? "gray.200" : "gray.100"}
    bg={isAvailable ? "white" : "gray.50"}
    _hover={{
      transform: isAvailable ? "translateY(-2px)" : "none",
      shadow: isAvailable ? "lg" : "none",
      borderColor: isAvailable ? `${color}.300` : "gray.100",
    }}
    transition="all 0.2s"
    cursor={isAvailable ? "pointer" : "default"}
    onClick={isAvailable ? onPreview : undefined}
    opacity={isAvailable ? 1 : 0.6}
  >
    <CardBody p={4}>
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <Box
            p={2}
            bg={isAvailable ? `${color}.100` : "gray.200"}
            color={isAvailable ? `${color}.600` : "gray.500"}
            borderRadius="lg"
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text
              fontWeight="medium"
              color={isAvailable ? "gray.700" : "gray.500"}
            >
              {title}
            </Text>
            {!isAvailable && (
              <Text fontSize="xs" color="gray.400">
                File tidak tersedia
              </Text>
            )}
          </VStack>
        </HStack>
        {isAvailable ? (
          <Button
            size="sm"
            colorScheme={color}
            variant="ghost"
            leftIcon={<FaEye />}
            _hover={{ bg: `${color}.100` }}
          >
            Lihat
          </Button>
        ) : (
          <Badge
            size="sm"
            colorScheme="gray"
            variant="outline"
            px={2}
            py={1}
            borderRadius="md"
          >
            Tidak Ada
          </Badge>
        )}
      </HStack>
    </CardBody>
  </Card>
);

export default DetailNaikJenjang;
