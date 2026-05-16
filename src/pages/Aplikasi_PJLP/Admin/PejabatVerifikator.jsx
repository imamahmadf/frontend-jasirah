import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
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
  Flex,
  Spacer,
  useDisclosure,
  Center,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
function PejabatVerifikator() {
  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataPejabat, setDataPejabat] = useState(null);
  const history = useHistory();
  const user = useSelector(userRedux);
  const toast = useToast();
  const role = useSelector(selectRole);
  const [pegawaiId, setPegawaiId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  async function fetchDataPejabat() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/pejabat-verifikator`
      )
      .then((res) => {
        setDataPejabat(res.data.result);

        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const tambahPejabat = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/post/pejabat-verifikator`,
        {
          pegawaiId,
          unitKerjaId,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Data berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
        fetchDataPejabat();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data gagal ditambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };

  useEffect(() => {
    fetchDataPejabat();
  }, []);

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <HStack gap={5} mb={"30px"}>
            <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
              Tambah +
            </Button>{" "}
          </HStack>{" "}
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Nama</Th>
                <Th>Jabatan</Th>
                <Th>NIP</Th>
                <Th>Unit Kerja</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody bgColor={"secondary"}>
              {dataPejabat &&
                dataPejabat.map((item, index) => (
                  <Tr key={`${index}`}>
                    <Td>{index + 1}</Td>
                    <Td>{item.pegawai.nama}</Td>
                    <Td>{item.pegawai.jabatan}</Td>
                    <Td>{item.pegawai.NIP || "-"}</Td>
                    <Td>{item.daftarUnitKerja.unitKerja}</Td>

                    <Td>
                      <Flex gap={"20px"}>
                        <Button variant={"primary"}>Edit</Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>

        <Modal
          closeOnOverlayClick={false}
          isOpen={isTambahOpen}
          onClose={onTambahClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="1200px">
            <ModalHeader></ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box>
                <HStack>
                  <Box bgColor={"pegawai"} width={"30px"} height={"30px"}></Box>
                  <Heading color={"pegawai"}>Tambah Pejabat</Heading>
                </HStack>

                <SimpleGrid columns={2} spacing={10} p={"30px"}>
                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue) return [];
                        try {
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/pegawai/search?q=${inputValue}`
                          );

                          const filtered = res.data.result;

                          return filtered.map((val) => ({
                            value: val.id,
                            label: val.nama,
                          }));
                        } catch (err) {
                          console.error("Failed to load options:", err.message);
                          return [];
                        }
                      }}
                      placeholder="Ketik Nama Pegawai"
                      onChange={(selectedOption) => {
                        setPegawaiId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: { borderColor: "yellow.700" },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "pegawai" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>

                  <FormControl my={"30px"}>
                    <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue) return [];
                        try {
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/admin/search/unit-kerja?q=${inputValue}`
                          );

                          const filtered = res.data.result;

                          return filtered.map((val) => ({
                            value: val.id,
                            label: val.unitKerja,
                          }));
                        } catch (err) {
                          console.error("Failed to load options:", err.message);
                          return [];
                        }
                      }}
                      placeholder="Ketik Nama Unit Kerja"
                      onChange={(selectedOption) => {
                        setUnitKerjaId(selectedOption.value);
                      }}
                      components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      }}
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "terang",
                          border: "0px",
                          height: "60px",
                          _hover: { borderColor: "yellow.700" },
                          minHeight: "40px",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          bg: state.isFocused ? "pegawai" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            </ModalBody>

            <ModalFooter pe={"60px"} pb={"30px"}>
              <Button onClick={tambahPejabat} variant={"primary"}>
                Tambah Kendaraan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </LayoutPegawai>
  );
}

export default PejabatVerifikator;
