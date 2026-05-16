import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { Link, useHistory } from "react-router-dom";

import { useDisclosure } from "@chakra-ui/react";

import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useFormik } from "formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import YupPassword from "yup-password";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  Heading,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Image,
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Select,
  Td,
  Flex,
  Textarea,
  Alert,
  Toast,
  Input,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../../Redux/Reducers/auth";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";

function LaporanUsulanPegawai() {
  const [dataUsulan, setDataUsulan] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const history = useHistory();
  const toast = useToast();
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const changePage = ({ selected }) => {
    setPage(selected);
  };
  const tambahLaporan = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/usulan/post/laporan-usulan-pegawai`,
        {
          tanggalAwal,
          tanggalAkhir,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };
  const ubahStatus = (val) => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/usulan/update/laporan-usulan-pegawai/${val}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        fetchUsulan();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  async function fetchUsulan() {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/usulan/get/laporan-usulan-pegawai?&page=${page}&limit=${limit}`
      )
      .then((res) => {
        // Tindakan setelah berhasil
        setDataUsulan(res.data.result);
        setPage(res.data.page);
        setPages(res.data.totalPage);
        setRows(res.data.totalRows);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  useEffect(() => {
    fetchUsulan();
  }, [page]);
  return (
    <LayoutPegawai>
      <Box minHeight={"70vh"} bgColor={"secondary"} py={"60px"} px={"30px"}>
        <Container
          border={"1px"}
          borderRadius={"6px"}
          borderColor={"rgba(229, 231, 235, 1)"}
          maxW={"1880px"}
          bgColor={"white"}
          p={"30px"}
        >
          <HStack gap={5} mb={"30px"}>
            <Button onClick={onTambahOpen} variant={"primary"} px={"50px"}>
              Tambah +
            </Button>
          </HStack>
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Tanggal Awal</Th>
                <Th>Tanggal Akhir</Th>
                <Th>Status</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataUsulan?.map((item, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>
                    {new Date(item?.tanggalAwal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>
                    {" "}
                    {new Date(item?.tanggalAkhir).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>{item?.status}</Td>
                  <Td>
                    {item?.status === "Buka" ? (
                      <Button
                        onClick={() => {
                          ubahStatus(item.id);
                        }}
                      >
                        Ubah
                      </Button>
                    ) : null}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>
      </Box>
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
                <Heading color={"pegawai"}>Buat Jadwal</Heading>
              </HStack>

              <SimpleGrid columns={2} spacing={10} p={"30px"}>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tanggal Awal</FormLabel>
                  <Input
                    height={"60px"}
                    type={"date"}
                    bgColor={"terang"}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                  />
                </FormControl>
                <FormControl my={"30px"}>
                  <FormLabel fontSize={"24px"}>Tanggal Akhir</FormLabel>
                  <Input
                    height={"60px"}
                    type={"date"}
                    bgColor={"terang"}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </ModalBody>

          <ModalFooter pe={"60px"} pb={"30px"}>
            <Button onClick={tambahLaporan} variant={"primary"}>
              Buat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default LaporanUsulanPegawai;
