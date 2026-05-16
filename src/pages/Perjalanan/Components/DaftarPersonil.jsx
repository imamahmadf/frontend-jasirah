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
  Button,
  VStack,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useFormikContext, getIn } from "formik";
import axios from "axios";

const DaftarPersonil = ({ dataPegawai }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const personil = values.personil || [];

  const handleResetPersonil = () => {
    // Reset semua personil ke null
    [0, 1, 2, 3, 4].forEach((index) => {
      setFieldValue(`personil[${index}]`, null);
    });
  };

  return (
    <Container
      maxW={"1280px"}
      variant={"primary"}
      pt={"30px"}
      ps={"0px"}
      mb={"30px"}
    >
      <HStack justify="space-between" mb="20px">
        <HStack>
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
        <Button
          onClick={handleResetPersonil}
          variant="outline"
          colorScheme="red"
          size="sm"
          _hover={{
            bg: "red.50",
            borderColor: "red.300",
          }}
        >
          Reset Personil
        </Button>
      </HStack>

      <SimpleGrid columns={2} spacing={6} p={"30px"}>
        {[0, 1, 2, 3, 4].map((index) => {
          const fieldName = `personil[${index}]`;
          const error = index === 0 ? getIn(errors, fieldName) : null;
          const isTouched = index === 0 ? getIn(touched, fieldName) : null;

          return (
            <FormControl key={index} isInvalid={!!error && isTouched}>
              <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                Personil {index + 1}
              </FormLabel>
              <AsyncSelect
                loadOptions={async (inputValue) => {
                  if (!inputValue) return [];
                  try {
                    const res = await axios.get(
                      `${
                        import.meta.env.VITE_REACT_APP_API_BASE_URL
                      }/pegawai/search?q=${inputValue}`
                    );

                    const filtered = res.data.result
                      ?.filter((val) => val.profesiId !== 1)
                      .map((val) => ({
                        value: val,
                        label: val.nama,
                      }));

                    return filtered || [];
                  } catch (err) {
                    console.error("Failed to load options:", err.message);
                    return [];
                  }
                }}
                placeholder="Ketik Nama Pegawai"
                onChange={(selectedOption) =>
                  setFieldValue(fieldName, selectedOption)
                }
                value={personil[index] || null}
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
              {index === 0 && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

export default DaftarPersonil;
