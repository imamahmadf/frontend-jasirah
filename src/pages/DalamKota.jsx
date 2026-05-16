import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import {
  Box,
  Text,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux } from "../Redux/Reducers/auth";
import Loading from "../Componets/Loading";

function DalamKota() {
  const [dataDalamKota, setDataDalamKota] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);

  const indukUnitKerjaId = user[0]?.unitKerja_profile?.indukUnitKerja?.id;

  async function fetchDalamKota() {
    if (!indukUnitKerjaId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/dalam-kota/get/dalam-kota/${indukUnitKerjaId}`
      );
      setDataDalamKota(res.data?.result || []);
    } catch (err) {
      console.error(err);
      setDataDalamKota([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDalamKota();
  }, [indukUnitKerjaId]);

  const getStatusColor = (status) => {
    if (!status) return "gray";
    const s = String(status).toLowerCase();
    if (s === "aktif") return "green";
    if (s === "nonaktif" || s === "non aktif") return "red";
    return "gray";
  };

  if (isLoading) return <Loading />;

  return (
    <Layout seoProps={{ title: "Tujuan Dalam Kota - Dinkes" }}>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"70vh"}>
        <Container maxW={"1280px"} variant={"primary"} pt={"30px"} px={"0px"}>
          <Box p={"30px"}>
            <Heading
              size="md"
              mb={6}
              color={colorMode === "dark" ? "white" : "gray.700"}
            >
              Daftar Tujuan Dalam Kota
            </Heading>

            {dataDalamKota.length === 0 ? (
              <Box
                py={12}
                textAlign="center"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                <Text fontSize="lg">Belum ada data tujuan dalam kota.</Text>
              </Box>
            ) : (
              <Table variant={"primary"}>
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Nama Tujuan</Th> <Th>Uang Transport</Th>
                    <Th>Durasi (jam)</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataDalamKota.map((item, index) => (
                    <Tr key={item.id}>
                      <Td>{index + 1}</Td>
                      <Td>{item.nama || "–"}</Td>{" "}
                      <Td>{item.uangTransport ?? "–"}</Td>
                      <Td>{item.durasi ?? "–"}</Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(item.status)}
                          variant="subtle"
                        >
                          {item.status || "–"}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}

export default DalamKota;
