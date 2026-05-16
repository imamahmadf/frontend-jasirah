import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import {
  Box,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
  VStack,
  useColorMode,
  Button,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  HStack,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Center,
  SimpleGrid,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import {
  FaSearch,
  FaFolderOpen,
  FaList,
  FaFileAlt,
  FaBuilding,
  FaEye,
  FaChevronRight,
} from "react-icons/fa";
import Loading from "../../Componets/Loading";

function DaftarProgram() {
  const [DataSuratPesanan, setDataSuratPesanan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("semua"); // "semua", "program", "kegiatan", "subKegiatan"
  const [filterUnitKerja, setFilterUnitKerja] = useState("semua"); // "semua" atau nama unit kerja
  const [listUnitKerja, setListUnitKerja] = useState([]);
  const { colorMode } = useColorMode();
  const history = useHistory();
  const toast = useToast();

  // Debounce untuk search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function fetchDataProgram() {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim());
      }
      if (searchType !== "semua") {
        params.append("searchType", searchType);
      }
      if (filterUnitKerja !== "semua") {
        params.append("unitKerja", filterUnitKerja);
      }

      const queryString = params.toString();
      const url = `${
        import.meta.env.VITE_REACT_APP_API_BASE_URL
      }/perencanaan/get${queryString ? `?${queryString}` : ""}`;

      const res = await axios.get(url);
      setDataSuratPesanan(res.data.result || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data program",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch data unit kerja untuk dropdown (hanya sekali saat mount)
  async function fetchListUnitKerja() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/get/unit-kerja`
      );
      const data = res.data.result || [];
      // Pastikan data adalah array of strings atau array of objects dengan proper structure
      setListUnitKerja(data);
    } catch (err) {
      // Jika endpoint tidak ada, ambil dari data yang sudah ada
      console.warn(
        "Endpoint unit-kerja tidak tersedia, menggunakan data lokal"
      );
    }
  }

  // Fetch data setiap kali filter berubah
  useEffect(() => {
    fetchDataProgram();
  }, [debouncedSearchQuery, searchType, filterUnitKerja]);

  // Fetch list unit kerja saat mount
  useEffect(() => {
    fetchListUnitKerja();
  }, []);

  // Jika listUnitKerja kosong, ambil dari data yang sudah ada sebagai fallback
  useEffect(() => {
    if (listUnitKerja.length === 0 && DataSuratPesanan.length > 0) {
      const unitKerjaSet = new Set();
      DataSuratPesanan.forEach((program) => {
        program.kegiatans?.forEach((kegiatan) => {
          kegiatan.subKegPers?.forEach((sub) => {
            const unitKerja = sub.daftarUnitKerja?.unitKerja;
            if (unitKerja) {
              // Pastikan kita hanya menambahkan string
              const unitKerjaStr =
                typeof unitKerja === "string"
                  ? unitKerja
                  : unitKerja?.nama ||
                    unitKerja?.unitKerja ||
                    String(unitKerja);
              unitKerjaSet.add(unitKerjaStr);
            }
          });
        });
      });
      setListUnitKerja(Array.from(unitKerjaSet).sort());
    }
  }, [DataSuratPesanan, listUnitKerja.length]);

  // Hitung total statistik dari data yang sudah terfilter dari backend
  const stats = useMemo(() => {
    const totalProgram = DataSuratPesanan.length;
    const totalKegiatan = DataSuratPesanan.reduce(
      (sum, program) => sum + (program.kegiatans?.length || 0),
      0
    );
    const totalSubKegiatan = DataSuratPesanan.reduce(
      (sum, program) =>
        sum +
        (program.kegiatans?.reduce(
          (kegSum, kegiatan) => kegSum + (kegiatan.subKegPers?.length || 0),
          0
        ) || 0),
      0
    );

    return { totalProgram, totalKegiatan, totalSubKegiatan };
  }, [DataSuratPesanan]);

  if (isLoading) {
    return (
      <LayoutPerencanaan>
        <Loading />
      </LayoutPerencanaan>
    );
  }

  return (
    <LayoutPerencanaan>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH="100vh">
        <Container
          maxW={"1280px"}
          p={{ base: "20px", md: "30px" }}
          borderRadius={"12px"}
          bg={colorMode === "dark" ? "gray.800" : "white"}
          boxShadow="lg"
        >
          {/* Header Section */}
          <Box mb={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "start", md: "center" }}
              justify="space-between"
              mb={6}
              gap={4}
            >
              <Box>
                <Heading
                  size="lg"
                  mb={2}
                  color={colorMode === "dark" ? "white" : "gray.800"}
                >
                  Daftar Program
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Kelola dan lihat detail program, kegiatan, dan sub kegiatan
                </Text>
              </Box>
            </Flex>

            {/* Search Bar */}
            <Flex direction={{ base: "column", md: "row" }} gap={3} mb={6}>
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                size="lg"
                maxW={{ base: "100%", md: "180px" }}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              >
                <option value="semua">Semua</option>
                <option value="program">Program</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="subKegiatan">Sub Kegiatan</option>
              </Select>
              <Select
                value={filterUnitKerja}
                onChange={(e) => setFilterUnitKerja(e.target.value)}
                size="lg"
                maxW={{ base: "100%", md: "250px" }}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
                placeholder="Filter Unit Kerja"
              >
                <option value="semua">Semua Unit Kerja</option>
                {listUnitKerja.map((unitKerja, index) => {
                  // Pastikan kita selalu mendapatkan string untuk value dan display
                  const unitKerjaValue =
                    typeof unitKerja === "string"
                      ? unitKerja
                      : unitKerja?.nama ||
                        unitKerja?.unitKerja ||
                        String(unitKerja);
                  const unitKerjaLabel =
                    typeof unitKerja === "string"
                      ? unitKerja
                      : unitKerja?.nama ||
                        unitKerja?.unitKerja ||
                        String(unitKerja);

                  return (
                    <option key={index} value={unitKerjaValue}>
                      {unitKerjaLabel}
                    </option>
                  );
                })}
              </Select>
              <InputGroup size="lg" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder={
                    searchType === "semua"
                      ? "Cari program, kegiatan, atau sub kegiatan..."
                      : searchType === "program"
                      ? "Cari berdasarkan program..."
                      : searchType === "kegiatan"
                      ? "Cari berdasarkan kegiatan..."
                      : "Cari berdasarkan sub kegiatan..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
              </InputGroup>
            </Flex>

            {/* Statistics Cards */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
              <Card
                bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}
              >
                <CardBody>
                  <HStack>
                    <Icon as={FaFolderOpen} color="blue.500" boxSize={6} />
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Total Program
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {stats.totalProgram}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <Card
                bg={colorMode === "dark" ? "gray.700" : "green.50"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.600" : "green.200"}
              >
                <CardBody>
                  <HStack>
                    <Icon as={FaList} color="green.500" boxSize={6} />
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Total Kegiatan
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {stats.totalKegiatan}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <Card
                bg={colorMode === "dark" ? "gray.700" : "purple.50"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.600" : "purple.200"}
              >
                <CardBody>
                  <HStack>
                    <Icon as={FaFileAlt} color="purple.500" boxSize={6} />
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Total Sub Kegiatan
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {stats.totalSubKegiatan}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>

          {/* Program List */}
          {DataSuratPesanan.length === 0 ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Icon as={FaFolderOpen} boxSize={16} color="gray.400" />
                <Text fontSize="lg" color="gray.500" fontWeight="medium">
                  {debouncedSearchQuery || filterUnitKerja !== "semua"
                    ? "Tidak ada hasil pencarian"
                    : "Belum ada program"}
                </Text>
                {(debouncedSearchQuery || filterUnitKerja !== "semua") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      setFilterUnitKerja("semua");
                    }}
                  >
                    Hapus filter
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <Accordion allowMultiple defaultIndex={[]}>
              {DataSuratPesanan.map((program) => (
                <AccordionItem
                  key={program.id}
                  border="none"
                  mb={4}
                  borderRadius="lg"
                  overflow="hidden"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  boxShadow="sm"
                  _hover={{
                    boxShadow: "md",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  <AccordionButton
                    py={4}
                    px={6}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    }}
                  >
                    <Flex flex="1" textAlign="left" align="center" gap={4}>
                      <Icon
                        as={FaFolderOpen}
                        color="blue.500"
                        boxSize={5}
                        flexShrink={0}
                      />
                      <Box flex="1">
                        <HStack mb={1}>
                          <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            {program.kode} - {program.nama}
                          </Text>
                        </HStack>
                        <HStack spacing={3} fontSize="sm" color="gray.500">
                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            borderRadius="full"
                            px={2}
                            py={1}
                          >
                            {program.kegiatans?.length || 0} Kegiatan
                          </Badge>
                          <Text>•</Text>
                          <Text>
                            {program.kegiatans?.reduce(
                              (sum, k) => sum + (k.subKegPers?.length || 0),
                              0
                            ) || 0}{" "}
                            Sub Kegiatan
                          </Text>
                        </HStack>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(
                            `/perencanaan/detail-program/${program.id}`
                          );
                        }}
                        leftIcon={<FaEye />}
                        mr={2}
                      >
                        Detail
                      </Button>
                      <AccordionIcon />
                    </Flex>
                  </AccordionButton>
                  <AccordionPanel pb={4} px={6}>
                    {program.kegiatans && program.kegiatans.length > 0 ? (
                      <Accordion allowMultiple>
                        {program.kegiatans.map((kegiatan) => (
                          <AccordionItem
                            key={kegiatan.id}
                            border="none"
                            mb={3}
                            borderRadius="md"
                            bg={colorMode === "dark" ? "gray.600" : "white"}
                            borderLeft="3px solid"
                            borderLeftColor="green.400"
                          >
                            <AccordionButton
                              py={3}
                              px={4}
                              _hover={{
                                bg:
                                  colorMode === "dark" ? "gray.500" : "gray.50",
                              }}
                            >
                              <Flex
                                flex="1"
                                textAlign="left"
                                align="center"
                                gap={3}
                              >
                                <Icon
                                  as={FaList}
                                  color="green.500"
                                  boxSize={4}
                                  flexShrink={0}
                                />
                                <Box flex="1">
                                  <Text
                                    fontWeight="semibold"
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.800"
                                    }
                                  >
                                    {kegiatan.kode} - {kegiatan.nama}
                                  </Text>
                                  <Badge
                                    colorScheme="green"
                                    variant="subtle"
                                    fontSize="xs"
                                    mt={1}
                                  >
                                    {kegiatan.subKegPers?.length || 0} Sub
                                    Kegiatan
                                  </Badge>
                                </Box>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    history.push(
                                      `/perencanaan/detail-kegiatan/${kegiatan.id}`
                                    );
                                  }}
                                  leftIcon={<FaEye />}
                                >
                                  Detail
                                </Button>
                                <AccordionIcon />
                              </Flex>
                            </AccordionButton>
                            <AccordionPanel px={4} pb={3}>
                              {kegiatan.subKegPers &&
                              kegiatan.subKegPers.length > 0 ? (
                                <VStack align="stretch" spacing={3}>
                                  {kegiatan.subKegPers.map((sub) => (
                                    <Card
                                      key={sub.id}
                                      size="sm"
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.50"
                                      }
                                      borderLeft="3px solid"
                                      borderLeftColor="purple.400"
                                      _hover={{
                                        boxShadow: "sm",
                                        transform: "translateX(4px)",
                                        transition: "all 0.2s",
                                      }}
                                    >
                                      <CardBody py={3} px={4}>
                                        <Flex
                                          align="center"
                                          justify="space-between"
                                          gap={4}
                                        >
                                          <Box flex="1">
                                            <HStack mb={2}>
                                              <Icon
                                                as={FaFileAlt}
                                                color="purple.500"
                                                boxSize={4}
                                              />
                                              <Text
                                                fontWeight="semibold"
                                                fontSize="sm"
                                                color={
                                                  colorMode === "dark"
                                                    ? "white"
                                                    : "gray.800"
                                                }
                                              >
                                                {sub.kode} - {sub.nama}
                                              </Text>
                                            </HStack>
                                            {sub.daftarUnitKerja?.unitKerja && (
                                              <HStack spacing={2} fontSize="xs">
                                                <Icon
                                                  as={FaBuilding}
                                                  color="gray.400"
                                                  boxSize={3}
                                                />
                                                <Text color="gray.500">
                                                  {
                                                    sub.daftarUnitKerja
                                                      .unitKerja
                                                  }
                                                </Text>
                                              </HStack>
                                            )}
                                          </Box>
                                          <Button
                                            size="xs"
                                            colorScheme="purple"
                                            variant="ghost"
                                            onClick={() =>
                                              history.push(
                                                `/perencanaan/detail-sub-kegiatan/${sub.id}`
                                              )
                                            }
                                            rightIcon={<FaChevronRight />}
                                          >
                                            Detail
                                          </Button>
                                        </Flex>
                                      </CardBody>
                                    </Card>
                                  ))}
                                </VStack>
                              ) : (
                                <Center py={4}>
                                  <Text
                                    fontSize="sm"
                                    color="gray.400"
                                    fontStyle="italic"
                                  >
                                    Tidak ada sub kegiatan
                                  </Text>
                                </Center>
                              )}
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <Center py={4}>
                        <Text fontSize="sm" color="gray.400" fontStyle="italic">
                          Tidak ada kegiatan
                        </Text>
                      </Center>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Container>
      </Box>
    </LayoutPerencanaan>
  );
}

export default DaftarProgram;
