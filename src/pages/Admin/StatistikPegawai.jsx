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
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";

const STATUS_CONFIG = [
  { key: "PNS", label: "PNS" },
  { key: "CPNS", label: "CPNS" },
  { key: "P3K", label: "P3K" },
  { key: "P3KPW", label: "P3K Paruh Waktu" },
  { key: "PJPL", label: "PJLP" },
];

function StatistikPegawai() {
  const [dataPegawai, setDataPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/unit-kerja-pegawai`
      );
      setDataPegawai(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataPegawai();
  }, []);
  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          maxW={"4880px"}
          variant={"primary"}
          p={"30px"}
          style={{ overflowX: "auto" }}
        >
          {dataPegawai?.map((unit, index) => (
            <Box key={unit.unitKerjaId} mb={10}>
              <Heading size="md" mb={3}>
                {index + 1}. {unit.namaUnitKerja}
              </Heading>
              <Text mb={2}>
                <strong>Total Pegawai:</strong> {unit.totalPegawai}
              </Text>
              <HStack spacing={6} mb={4}>
                {STATUS_CONFIG.map((status) => {
                  let value = unit.statusPegawai?.[status.key] || 0;

                  if (status.key === "P3KPW") {
                    value =
                      unit.statusPegawai?.P3KPW ??
                      unit.statusPegawai?.p3KPW ??
                      0;
                  }

                  if (status.key === "PJPL") {
                    value =
                      unit.statusPegawai?.PJPL ??
                      unit.statusPegawai?.PJLP ??
                      0;
                  }

                  return (
                    <Text key={status.key}>
                      <strong>{status.label}:</strong> {value}
                    </Text>
                  );
                })}
              </HStack>
              <Table variant="pegawai" size="sm" mb={6}>
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    {Object.values(unit.profesi).map((profesi, i) => (
                      <Th key={i} isNumeric>
                        {profesi.namaProfesi}
                      </Th>
                    ))}
                    <Th isNumeric>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {STATUS_CONFIG.map((status) => {
                    let totalPerStatus = 0;

                    return (
                      <Tr key={status.key}>
                        <Td fontWeight="bold">{status.label}</Td>
                        {Object.values(unit.profesi).map((profesi) => {
                          let jumlah = profesi.jumlah[status.key] || 0;

                          if (status.key === "P3KPW") {
                            jumlah =
                              profesi.jumlah.P3KPW ||
                              profesi.jumlah.p3KPW ||
                              0;
                          }

                          if (status.key === "PJPL") {
                            jumlah =
                              profesi.jumlah.PJPL ||
                              profesi.jumlah.PJLP ||
                              0;
                          }

                          totalPerStatus += jumlah;
                          return (
                            <Td key={profesi.namaProfesi} isNumeric>
                              {jumlah}
                            </Td>
                          );
                        })}
                        <Td isNumeric fontWeight="bold">
                          {totalPerStatus}
                        </Td>
                      </Tr>
                    );
                  })}

                  {/* Baris Total per Profesi */}
                  <Tr bg="gray.50">
                    <Td fontWeight="bold">Total</Td>
                    {Object.values(unit.profesi).map((profesi) => {
                      const totalProfesi =
                        (profesi.jumlah.PNS || 0) +
                        (profesi.jumlah.CPNS || 0) +
                        (profesi.jumlah.P3K || 0) +
                        (profesi.jumlah.P3KPW ||
                          profesi.jumlah.p3KPW ||
                          0) +
                        (profesi.jumlah.PJPL || profesi.jumlah.PJLP || 0);

                      return (
                        <Td
                          key={profesi.namaProfesi + "_total"}
                          isNumeric
                          fontWeight="bold"
                        >
                          {totalProfesi}
                        </Td>
                      );
                    })}
                    <Td isNumeric fontWeight="bold">
                      {unit.totalPegawai}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          ))}
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default StatistikPegawai;
