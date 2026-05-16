import React from "react";
import {
  Box,
  Heading,
  HStack,
  Container,
  FormControl,
  FormLabel,
  SimpleGrid,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { useFormikContext, getIn } from "formik";

const DaftarPersonil = ({ dataPegawai }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const personil = values.personil || [];

  return (
    <Container
      maxW={"1280px"}
      variant={"primary"}
      pt={"30px"}
      ps={"0px"}
      mb={"30px"}
    >
      <HStack mb={"20px"}>
        <Box
          bgColor={"primary"}
          width={"30px"}
          height={"30px"}
          borderRadius={"4px"}
        ></Box>
        <Heading color={"primary"} fontSize={"28px"} fontWeight={"600"}>
          Daftar Personil
        </Heading>
      </HStack>

      <SimpleGrid columns={2} spacing={6} p={"30px"}>
        <FormControl
          isInvalid={
            getIn(touched, "personil[0]") && getIn(errors, "personil[0]")
          }
        >
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Personil 1
          </FormLabel>
          <Select2
            options={dataPegawai.result
              ?.filter((val) => val.profesiId == 1)
              .map((val) => ({
                value: val,
                label: `${val.nama}`,
              }))}
            placeholder="Cari Nama Pegawai"
            focusBorderColor="red"
            onChange={(selectedOption) => {
              setFieldValue("personil[0]", selectedOption);
            }}
            value={personil[0] || null}
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
                _hover: {
                  borderColor: "yellow.700",
                },
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                bg: state.isFocused ? "primary" : "white",
                color: state.isFocused ? "white" : "black",
              }),
            }}
          />
          <FormErrorMessage>{getIn(errors, "personil[0]")}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
    </Container>
  );
};

export default DaftarPersonil;
