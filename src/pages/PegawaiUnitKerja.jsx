import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
  Td,
  Flex,
  Textarea,
  Input,
  Tooltip,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import Layout from "../Componets/Layout";
import { userRedux, selectRole } from "../Redux/Reducers/auth";
import { useSelector } from "react-redux";
import axios from "axios";

function PegawaiUnitKerja() {
  const history = useHistory();
  const user = useSelector(userRedux);
  const [dataPegawai, setDataPegawai] = useState(null);
  const token = localStorage.getItem("token");
  async function fetchDataPegawai() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/unit-kerja/${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");

        setDataPegawai(res.data.result);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
  const downloadExcelPegawai = async (unitKerjaId = null) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/download?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }`,
        {
          responseType: "blob", // agar respons dibaca sebagai file
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-pegawai.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };
  useEffect(() => {
    fetchDataPegawai();
  }, []);
  return (
    <Layout>
      <Box px={"30px"}>
        <Container maxW={"2280px"} variant={"primary"} ps={"0px"} mb={"30px"}>
          <Box p={"30px"}>
            {" "}
            <Button onClick={downloadExcelPegawai}>DL</Button>
            <Table variant={"primary"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Nama</Th>
                  <Th>NIP</Th>
                  <Th>Pangkat</Th>
                  <Th>Golongan</Th>
                  <Th>Jabatan</Th>
                  <Th>Tingkatan</Th>
                  <Th>Pendidikan</Th>
                  <Th>Status Pegawai</Th>
                  <Th>Profesi</Th>
                  <Th>Unit Kerja</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataPegawai?.map((item, index) => (
                  <Tr>
                    <Td>{index + 1}</Td>
                    <Td>{item.nama}</Td>
                    <Td minWidth={"200px"}>{item.nip}</Td>
                    <Td>{item.daftarPangkat.pangkat}</Td>
                    <Td>{item.daftarGolongan.golongan}</Td>
                    <Td>{item.jabatan}</Td>
                    <Td>{item.daftarTingkatan.tingkatan}</Td>

                    <Td>{item.pendidikan}</Td>
                    <Td>{item?.statusPegawai?.status}</Td>
                    <Td>{item?.profesi?.nama}</Td>
                    <Td>{item?.daftarUnitKerja?.unitKerja}</Td>
                    <Td>
                      <Button
                        onClick={() =>
                          history.push(`/admin/edit-pegawai/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}

export default PegawaiUnitKerja;
