import React, { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Classement.css"

// Configuration de l'URL de l'API
const API_URL = process.env.REACT_APP_API_URL

function Ranking() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_URL}/routejsp`, {
        withCredentials: true,
      })

      setUsers(response.data.users)
      setCurrentUser(response.data.currentUser)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la récupération du classement")
      console.error("Erreur:", err)

      setUsers([
        {
          id: 1,
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@email.com",
          avatar: "data:image/png;base64,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",
          totalApplications: 45,
          acceptedApplications: 8,
          pendingApplications: 12,
          rejectedApplications: 25,
          successRate: 17.8,
        },
        {
          id: 2,
          firstName: "Pierre",
          lastName: "Martin",
          email: "pierre.martin@email.com",
          avatar: "https://i.pinimg.com/originals/04/e5/33/04e533d988c2e7149eb56a8ee5be7069.jpg",
          totalApplications: 38,
          acceptedApplications: 6,
          pendingApplications: 15,
          rejectedApplications: 17,
          successRate: 15.8,
        },
        {
          id: 3,
          firstName: "Sophie",
          lastName: "Bernard",
          email: "sophie.bernard@email.com",
          avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIREhUSEhMWFhUXGBcXGBgXGBcVFxcVGBcYFxYaFhcYHSkgGBolGxcVITEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy4mICYtLy0tLS0vLS0tLTAtLzUtLS0rLS8tLS0tLS0tLSstLy0vLS8tLS0tLS0tLi0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABQYEBwECAwj/xABLEAABAwICBwQGBgcGAwkAAAABAAIDBBEFIQYSMUFRYXETgZGhByIyscHRFCNCUmJyQ1OCkrLh8BU0Y3Oi8RYkMyU1g5Ojs8LS4v/EABoBAQADAQEBAAAAAAAAAAAAAAABAwQCBQb/xAAxEQACAQIEAggGAgMAAAAAAAAAAQIDEQQSITFBUQUTIjJhcZGxFCOBodHwM+FCYsH/2gAMAwEAAhEDEQA/ANGoiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiALJmoJGRxyuaQyTW1HbjqktcOtxsWMt2aP6Px1WGwUsgsHsDgd7HuJeHDnd3fcjeobsSlc0mikceweWjnfBM2zmHbuc3c5p3tIzUcpICIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiA5C+j8Hi7MQt+6GN8AAvnegZrSxgb3tHi4L6LBsb8CuZbFkDw9JGh4xGC7ABUR3MZy9Yb4yeB3cD1K+dponMcWuBDmkgg5EEGxBG43X1wDfNas9L+hXaNdX07fXaPrmj7TR+kA+8N/LPdnRSqW7LJnHiaXREWkqCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgJDR5mtVQDjLH/GF9AlaI0Mi1q6nH+I0/u+t8FvdQyyBY8Pk1o2nlbwyXuQovA5faZ3j3H4KVWKatItPn70paGGhm7aFv/LSn1bbI37Sw8BtI5ZblRF9X4xhkdVC+CYXY8WPEcCODgbEHiF8zaUYDLQVD6eXaM2uGx7D7Lh14biCFopTzKzKZxsRKIiuOAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAsOgH/eFP8Amd/A5bwWkfR4P+0IOr//AG3rbuN41BSM15n24NGb3Hg1u/3KGWQ2Jekm1Hh3j03qenrI42675GMba93ODRbqStF1+lNfWXEI+jxHf9sj823923VR7MDa460z3yu4uJ/381jr1Kaer18DbQwderrGOnN6G4K70i4ZEbGpa4/4bXSebRbzVE9ImlVBiUAZHFUGVlzHJ2QsCbXa71r6rh4WBUPDQxM9mNoPGwv4r3dIBtICzfFRT7KN8eiG125+iNfSRObtBHUEe9eav1Q+J7S15aRz+e5VGow4ukLacOlG7UaXkX3ZDNbaGI6zdWPPxuAeHs1K6+/oR6Kfo9CsRl9ikm/aYYx4vspAejPFL2+jf+pF/wDZXOpBbtGJQk+BUEVqqfR1ibNtK4/lcx/kHXUHXYPUQf8AVgljt99jmjxIspU4vZkOElujBREXRyEREAREQBERAEREAREQBERAEREAREQEro3ihpZhK1us8NcGDdruGqCeIz2KxQ0b5H9vUuMkp45hvAAbMvBROjlM1o7Z9r7GDaeZt5KdDnv2eqOO9ediq7vkjouLPoOjcFFRVWorvgv+ntJIG7TZeYlcfZbbm7LyRsLWesepcf6yXphVDVV7tSjZZl7OneLRt46t/aPIX+KxQhm29XserWxEaSvJ+SW7MSrmbGLyy25DK/QDMrMwnR2urLdhT9lGf00+WXFrTme4HuWxNGPR5S0jhK+9RP8ArJMwD+BmwdTc81cKqSOFnaTvEbd183O/K3aVanFaRV39vT8nk1sXUn/qvDf1/BQ8D9F9NGQ+qe6pfwd6sQPJgOfebclfabD2xMs1rIox+WNoHRVLFtOnZtpWCNv6x9nPPMA5N8+5UfE9JA83mndIepfbpuCt6qc+8zJqtdvPVm1arSGiiydPrnhG0u/1bPNYL9NaQbIpj1LB8VqCfSP7jO9x+A+axH49MdmqOg+asWGXIhyXNm5Tp3ANlM89ZAPcF6M05pXZPppAOTmu95C0o3HZhvB6tHwXq3HZCczboBZdfDrkc3j4+psPSLR3BMQBcyR1LNbJ4js0ndrtaNU9bg81pbFsLkp3lrxcX9V4vquHEfI5q5Q4s7fZw8FnCSKoaWOFwRm07e75hWwbhpwOJUIy2eprBFNaRYIac6zc43bDvaeB+ahVoTTV0Y5RcXZhERSchERAEREAREQBERAERe1LTOkcGtFyeYHvUN21ZKTbsjxXvSUzpHarRc+4cVKM0bl2kt6A5nlssFOYQ2INLY2lpBs4O9u/4uPuWarioxjeOp6OG6OnOaVTsr7vyPSioQxoBzIAHRZT3AAkmwGZPJdl66O4N/alSKcOIgjHaVDx90H1GNPFzsulzuXlxi6stfqfQ16sMNSv9EjI0S0Ufih7aYuZRtd6rRk6cjbnuZfK/hnmNxUFE1jWxRMDWtFmtaLNaAlLTtY1scbQ1rQGta0WAAyAA4KvaaY/2YNJCc7fXPG38gO7n4cVYr1HZaJfvqeHOUm7vWT/AH0MjHNLo6cmOmAkkGRkObGn8I+0eezqtVY9pYXPJLjLId5ue4AbumSj63EDUOLIyRCDZzhkZDwadzee9dYYWsFmtA6BejSw6SMFXFKDtHV8yOqKipm2tNvxHVaP2V1GHS73sHQEqXRaVFIxyxE3xIk4bJ+sb+6fmujqGcfcPeR71OQQuedVjXOdwaC4+AU5SaGV8mYp3NH4y1nk438lzJwj3mkc9fNcSgvEjfaid1b63uXEczXbDnw2FbHm0BxBov2TXcmvYT5kKkY1HE1xZIPrGkizLF7SNxsuYuE+6y2GJlxPCnm1TyUjG8tIINiFAR9rssORdkfAKQkinYA5+s1uQBMZDeXrOC76mb4GhYmCLTLG2phLT9oEdHbj3GxWs5GEEg7QbHqFedHa12t2TrEEFzSBY5WvfxCqGMi08v8AmP8A4iuIxcJOLOq041IqaMNERWGYIvc0knZ9rqO7Mu1A63ql1r2vxsvBAEREAREQH0lhuF4eMvolOx3HsmWPeRkpE6M0JN/olPc7+yj+S1NoNprrWp6p2eyOQ7+DXnjwO/etm0mIPjy2t4H4Hcss4NPQ0JpkhBgNIzJlNA3pEwfBROmmj0NRT6mqGG/qFoDdV9jquFtnyJU7T4hG/fY8DksHHJhdrb7Mz/Xiq43zEmmsKmc6P6z22lzHfmabZ814TN1Kpjt0jS09W5hdsHl1+1k3PmkcOhN0rs5oBzee7VssjVqskttfY+jjJyw1OT3vH3t7DF6nVbqjhc9FP4SDTYXDq3bJVyuqHkbezidqQC43a2s4c1UMffbX6AeNvmrtpJF2Toaf9RTU8R/MIw93m8rRQilBeJgx83OulyLpo7pVIaWaeUNDo7RxuH6SVw+7+EWJ6rWOk1Y4gQtJ15b6x3hn2ieZ+anoCW07G3NnOc+27c29ugHgqfV1TTUSyOcAGfVNueGbvMq6jBZtDBiJuEG+LMiKMNAaMgMguyjnYuz7DXO6Cw8SuaeqnlNo4C7kCXnwaCtyi3sePZkkxhcQ1oJJIAAFySdgA3lbJ0Y9HTQ0SVly459kDYN/O4Zk8hl1VHwyHFqUOqIqPU1WkmSSJzixoF3FofYDLabX81hT6d4nJma4tHBjI2e4XVFalXnpCyQaN9PkpqOPMxQRjiWxt+F1UsU9K2Hxtd2BfUSDY1jXMaTzkeLAcxdaQrqwyHXmkfM770ry/bw1iukj3gAlrmtdk0lrmg9CRmqYdGwT+ZK7CgbBkxLFMXa9z5o6akabSODuxhbv1XyX15HWI9UZdLqHm/smkbZrpK6Ubm3pqYdT7bx0OfJVFwIyPW26/FcL0IU4wVoqyO1YtUGnlRDf6NDS0/8AlwNLu97y4krAxfS+vq2GOoqXyRmxLLMa0lpuMmtG/NQiALqyFyxaLN+sed4jYB3l1/cPBVTF3XnlP+I/+Iq2aPPDBPIfZaGi/wCUFx/iCpU0hc4uO0knxN1ml/JJmzajBHRSej2DSVkzYY9+bnbmsG1x/raQoxbq9H2A/RKbXeLSy2c7i1v2G+BueZ5KSuKuzrpngkceDyBgs2Ixanc9rXE8zrHPqtLr6U0zoQ/DamO17QucBt9Zg1/G7V81qunLNc7qKzCIisKwiIgCv2hmnJjtBVOJZkGyHMs3AP4t57R7qCuQoauSnY+iWOBAIIIIuCMwQdhBUFpljYpoSxuc0oLI2jbc5Fx5C/iqFo/Wz9nqw1Ukdsiw2eBzaHeyDyWZDQ2eZHvfJIftvOsR04LFUrwhdceR6tDAVa1n/i+NznDqXso2s4DPqcysaif2sz5R7LR2beZvdx9y64rVucewize72j9xu+54rIDBBCGjcLdXHf45rFZpXe8v257KcXJQj3Yb+a2X03fjYwWU30iqhh29rPHH3F4B8latIqrtaqeQbHSvt+UOIb5AKo4VVPiq6d8Zs9ji8GwNiAbGxU9e5W+MbJHjVnmrSZL4tKIo7n9HED3gXUNg+iFPHAyrxKpZC2VvaRxstJUSB3rAtbmGggjcdudllaaTDs36pycWMvyJAPldUiVoDjYWWrCR7OYwY2faUS7s0swyn/u2GdoRsfVSaxy36gDmg9LLrW+lTEHAth7GnbuEUYuBwu+48gqQi1W5mK/Ima/Syvna5ktXM5rhZzdazSDtBa2wtyURGy5suq9I2mx1Rcn1Wji52Qt3kKUkQzZvoc0QZLevnYHNBLYGuAIu0+tKQd9xYdDyW1sawqGrhfBOwPjeLEbwdxadzhuK64DhwpqaGBuyONjOpAzPebnvWevmK9aVSo5ehTKV2fMuk2AS0M7qecG1z2Mh2SR3yz42IuNxUQYXcF9O6RaP09fF2NQzWbe4INnNd95rhsKoo9DVPf8AvdRq8PUvbrq/BerR6Sg4/M3O1JGnexIzcQ0c1YNHdEKqsN4Yy2Pa6eQFsYbvLN8ht93xW6cD0Bw+lsWQB7xb15vrXZbxrZNP5QFC6W6UzsqX09LNAWxxF0wMTn9llqta54kAL3PLQGgCwzOzN8e5vLSX1Yvc09j8nYwMhYTquJLjvdvzPU+SrCsGlrs428AT42HwKr61NWZohJyirlm9H2DfSqtusLxx/WP4Gx9Ud7rdwK3jC272D8Q8s1pfQ2rkpAKiMF4JLZI/vRj7v4gbkdVs/CtLKSSz2TMBF7skPZuG4gh3wXMk7FtOSLpNEHtc12xwLT0IsV8r4rROgmkhdtje5h56pIv32W/q7TyliHryxdGu1z4MuVpnTms+k1T6psZYyQi18tbUaG61j7N7A2VNKEot3OqjRXURFeVBERAERcoCd7LMOBLXAWuDY/zWTDDNKbdq+283A8wF4xZgcwFY4ow0ADcvLrVcvmfU0MPGprw8Gzxo6JkQOoMztJzJ6lYmLy5hnDM/BSE8oY0uP9FV6eXa49SqaKc5ZmaK7jThkjoj0wRmtO9+5jQ3vP8AsVYohmOoUXgEGrEHHa8l579nl71MUbbu6Zr0ZaHgJ3156mDpbJZkQO+QeQPxIVdniNyVN6WDXkpo8iC4k9AW37rXXSTDWawZG2Z73XIjju91htNjezRxK00KijCzPOxj+aQYicdxXcUx32Cs9NohM8D6qqN92qcu9ot5qy4F6L3vc10sYjaM7vPaOPRhJHiup4qlBXZkzmt6Wl7RwZGHSPOxrGl5Pc25WzdAvR1P20dTWN7Nkbg+OHIvc8ZtdJbJoBsdXbcZ2WyXy0lBH6xhp2c9SIE9Ba56KvyabyVN24ZSSVO7tnjsacftPsX24ALzquOq1YuMI2XP+yLt7FwqJ2RtL3ua1ozLnENaBzJyCqVV6RqUv7KkZLWS7207C5oHFzzYW5i6xqLQeWpeJ8Xm+kOGbadl200Z/Llrn+jdXCOKCnbZojibyDYxYDuGxYLU4+L+xFkvEqztK8QG3B57cpoj5ALFOnNeTqtwWp1t136re92pYBTsukzZXGKhAqZBk5zT9RFzlmGRP4G3ceW1SFXiTKWIPqZW3AAJA1dd1s9Rlye7O3FdabZNeWo0W6KqyLGawHt3xYfBvEZEs+rv+sJ1WZfaGY4KnYzUU7G/RaNtoWu1nPJ1n1En33uOZtc267slm6V6WyVhMbbshv7P2n8C/wCWzqqXiNUdZsEWcshDR+HWIFz4r1MPQce1PTwX7qwrydkVnHqntJnEbB6o7tvndRys2nGjzaKSMRlxa9l7uNzrtNnd2bT3qsrS9zZly6Fl0TnJD2cCHDvyPuCuOAS0zJCKiCN7XW9Z0bXlp45jZnmqPopk55OywHfdWPtQjipRszLU7xtqgpIGtDoI4mtOYMbWgHoWhVf0laOtqIDK0WezaRvG4noT4E8FCYLitTAfqo5HNO1hY4tPMW2HmFZKzG6iaFzG0UwL2ltyMhcWJzAJWDqpU6iad0V6p3NCyMLSQRYjIjmuquOlOj8gHaGNzHjMggjWA95Cpy3GyMsyCIiHQWRSUxeeAG0qW0S0edWS55RMI7R3ua38R8lP6ZYYynmjMbAyN7NWwFhrs+JaR4KucrLTcvw9NSms2xAUTvVbyy8Db4K0EqqUmWsODj8x71J1dcXiwyG/n/JedXpuUtD6PCVVCnqda+p1zYeyNnPmo6aMyOZEPtHPk0bf65L1keGi52LOwOjOczxYuyaODP5q+jBLXkY8XVcuzxfsSzGgAAbBks6hZkT3LDAUlkxuexoue7MldyMyRXak9pXfhhYB+04f/ryUnovNJA6SdlTJTzve5p+pjmjMItqNOsQ4G+dxyUVgYLg+Y7ZXud+zfL4qTWrqk4WPDr1c1RtFjh0uxO5Dq2kA3EwTEkdAzJSP9tSzC0uMdmNhEFIWE8fXfcjqFS7rnWVDwi4L2/BTmZsvR/Q7C3O7YONbJvkqJO3d3tOQ723V1a0AAAAAZADIAcloGKZzCHNJa4bC0kEdCFYxp3WhgYHMyAGtq3ebbySSL9yzVcDVk9HfzIbb3NoYrh7aiMxPc9rTYkxvdG7I39ppBAVQqsJwSlJMrY5ZN/audVSd4eXW8lRq7GaibKWaRw4FxDf3RksBW0sA4rtS9ApNF4xDT8tb2dHC2Ju4uAy/KxvqjzVPra2SZxfK9z3He437hwHIKOrK+OIeu4DltJ7lCy4vLMdWFuo3e47fHYPetcKVOl3UdRpylsSOLYoI/UZ60h2Dbbmfks/0eYO58zqmTPUuA4560hyyPBov3kcFE6P4E6eXs2E32yynPVadoH4jmr9itSykhbBDkbWHFrd7jzOefUqyPadz0aNFU1dlK9JdaJZG2PqtJaO61z4+4Kr4Xhzp3WGTR7R4fzWfpS/1mN4AnxP8lL4DAGQN4u9Y9+zysj1kU1p21MmjomRN1WjvOZJ4lbC0JwljIxO5o1331Tb2Wg2y5nPusqKtpYAf+Wh/y2+5ZcZJqFkYmyQui4ReYQeNbSMmYWSNu0+XMcDzXz9prgv0SqfGPZvcdNvuIPevodar9MdJ6zZPwtPmWn3tWvCTebKWUpWkatRcrhbzWZ+EYxNSu1oXlt9o2tcODhv96m8d0w+lxsY+ENcx4frNflsII1SNhvx3BVVFDimdRk1sS8NQ0vuDk4eY/kvaSoaMr3PAZleWjtDHKXa4vqgWF7bb3OXTzVlp6GOP2GAHjv8AE5rPKEbnpUsRUceBGYfhbnkSTCwGbWfF3yU4uFkQUxOZyHvUNkW48T0o4vtHu+awsee+S1NC0ufILuDbXEQ9o58dnipGrqGxMc92TWi/yA5qBwKolbIao5SP3HMCPc3pkPJd0YZ5XOKs8qy8zxZFJF6sb9mXZSizhyvtC9Y6+TY+B45tIcFbXYtTVI1amIdSNYDoR6zV5S6LwyC9LUFnK/at7w46w8VpyzWzMksPTnqVg4xCDZzi0/ia4fBe7K+I7JGfvBZVTgFczLs2Sji1wF+51lHzYdMPbonf+WHfw3UZpLdFTwa4M9nV8Q2yM/eCxpccgb9u/QE+exYxjYDnTEHnER7wvVj3D2Kd/wCzC75KOsfIhYRcWdhi+t/0opH9Rqt8Sukgnf7cjYh91nrO73bu5ZcdFWSezTyftfVj/VZZ9LohVv8AbdHEOV3u8Bl5pebLYYaC4XIEwQsafVGe1zs3HvKkMGwOaqtqN7KH9YRa4/A3f12Ky0+BUVJ60ru0kGd5PWPdGMvJeOJaRvfdsQ1G7L/at/8AFdRpcy52W5mvqYKCPsYRdw7/AFjtdId55e4KszzOe4ucbk5kroonHq/UZqD2neTd5Vr0RXKVyCxWp7SVzhs2DoMv5q3YSbwx/lHlkqKrPgMk3YjVaxzbm13EEcd3FVJ6mSqronlftCcRD4exJ9aPYOLCbg9xNvBayM9R+paf/E/kvSlxGqjcHsiDXDYe0HyzCrrU+sjYoym7Fytdf8e1mr/dYQ620yOLb8dUNv5rtS4PiOJDWq6kxQH9HCNTWGzqW/muvOeHlHWWiIy82bAjla6+q4OsSDYg2I2g238lQPTCz6hh5OH+phV1wjC4qWIQwt1WDdckknaSTtKpfphI+js4+t/FGpw/8qsI95GmkXCL0jaEREBm4RW9jIHbjk78p+W3uVzhxOkP6Yd4LfeFr9FxKCkWwquGhsqPE6UbJY+9wv5rGq9Kadmxxefwj4mwWvkXPUos+JlwROV+PdvI3tG2iab6g38C7j0U9TzteNZhBHL48FRV609S6M6zCQff1G9XQajoUObbuy8rsx5abgkHiDY+KgqLSAHKUWPEZjvG0KWhqWP9l7T0KuTTOrkxBjtQz7et+Ya3ntWZHpTINrGHprD4lQK4UnSkyxjSx/6sfvH5IdLHfqh+8fkq4iE55E3JpPMdgYO4n3lYdRjE79shtwb6vuWAiEZmckrheVRVMjF3uA9/htUHXY+TlELfiO3uG5Q5JHDZJ4nibYRba/cOHM8lU55nPcXONydq6ucSbk3PErqqnK5y3cK36Mu+o6Od8/iqgp3RiuDXGN2Qcbt/Nst3/BQtyqorxLQiIuzKXXRHAGajZ5RrOdmwHY0bjbeTt5ZK2LBwF4NNCRs7No7wLHzBWcvFrTcpu5AWvPS64GNreDHHxc23uWw1qz0s1V3Pbf2WsZ3k6x8irMKr1DqHeRq1ERekbThERAEREAREQBERAEREBlQYhKz2Xkcto8Cs2PSCUbQ091vcohFN2Lk83SQ74x+9b4Ln/iT/AAv9X8lAIpzMm7JuTSJ+5jR1ufksSoxmZ4trav5cvPao9FGZi5yTfNcIiggIiIAuQuEQE/hmkBbZstyPvDb3jf1Vhp6hkguxwcOXx4LX67xSuabtJB4g2KlMqlST2Nz6JY+IfqZT9WTdrvuE7b/hPkr21wIBBBB2EZgjkvm6HH527SHfmHyspKl04qohZjtUcAXAeF1lrYdTeaOjKnRkb3xCvjgYXyOsNw3uPBo3laL03xTtpDn6xcXuHC/sjwKwcQ0pqZs3Oz45k24AuJt3KFc6+ZXdGiqa8TunSad2cIiK4vCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgP/Z",
          totalApplications: 32,
          acceptedApplications: 7,
          pendingApplications: 8,
          rejectedApplications: 17,
          successRate: 21.9,
        },
        {
          id: 4,
          firstName: "Thomas",
          lastName: "Petit",
          email: "thomas.petit@email.com",
          avatar: "",
          totalApplications: 28,
          acceptedApplications: 4,
          pendingApplications: 10,
          rejectedApplications: 14,
          successRate: 14.3,
        },
        {
          id: 5,
          firstName: "Julie",
          lastName: "Moreau",
          email: "julie.moreau@email.com",
          avatar: "",
          totalApplications: 25,
          acceptedApplications: 5,
          pendingApplications: 7,
          rejectedApplications: 13,
          successRate: 20.0,
        },
        {
          id: 6,
          firstName: "Antoine",
          lastName: "Leroy",
          email: "antoine.leroy@email.com",
          avatar: "",
          totalApplications: 22,
          acceptedApplications: 3,
          pendingApplications: 9,
          rejectedApplications: 10,
          successRate: 13.6,
        },
        {
          id: 7,
          firstName: "Emma",
          lastName: "Roux",
          email: "emma.roux@email.com",
          avatar: "",
          totalApplications: 19,
          acceptedApplications: 4,
          pendingApplications: 6,
          rejectedApplications: 9,
          successRate: 21.1,
        },
        {
          id: 8,
          firstName: "Lucas",
          lastName: "Fournier",
          email: "lucas.fournier@email.com",
          avatar: "",
          totalApplications: 15,
          acceptedApplications: 2,
          pendingApplications: 5,
          rejectedApplications: 8,
          successRate: 13.3,
        },
      ])
      setCurrentUser({ id: 2, rank: 1 })
      // pour choisir qui est identifié comme NOUS
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return "rank-gold"
      case 2:
        return "rank-silver"
      case 3:
        return "rank-bronze"
      default:
        return "rank-default"
    }
  }

  const getSuccessRateColor = (rate) => {
    if (rate >= 20) return "success-high"
    if (rate >= 15) return "success-medium"
    return "success-low"
  }

  // loading
  if (loading) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement du classement...</p>
          </div>
        </div>
      </div>
    )
  }

  // erreur
  if (error && users.length === 0) {
    return (
      <div className="ranking-page">
        <div className="ranking-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchRanking}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  const topThree = users.slice(0, 3)


  return (
    <div className="ranking-page">
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>🏆 Classement des Candidatures</h1>
          <p>Découvrez qui postule le plus activement</p>
          <button className="refresh-button" onClick={fetchRanking}>
            🔄 Actualiser
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Podium Top 3 */}
        {topThree.length > 0 && (
          <div className="podium-section">
            <h2>🏅 Podium</h2>
            <div className="podium">
              {topThree.map((user, index) => {
                const rank = index + 1
                return (
                  <div
                    key={user.id}
                    className={`podium-item ${getRankClass(rank)} ${currentUser?.id === user.id ? "current-user" : ""}`}
                  >
                    <div className="podium-rank">{getRankIcon(rank)}</div>
                    <div className="podium-avatar">
                      {user.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="podium-info">
                      <h3>
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="podium-stats">
                        <div className="stat-item">
                          <span className="stat-number">{user.totalApplications}</span>
                          <span className="stat-label">Candidatures</span>
                        </div>
                        <div className="stat-item">
                          <span className={`stat-number ${getSuccessRateColor(user.successRate)}`}>
                            {user.successRate}%
                          </span>
                          <span className="stat-label">Succès</span>
                        </div>
                      </div>
                    </div>
                    {currentUser?.id === user.id && <div className="current-user-badge">C'est vous !</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Classement complet */}
        <div className="ranking-section">
          <h2>📊 Classement Complet</h2>
          <div className="ranking-list">
            {users.map((user, index) => {
              const rank = index + 1
              return (
                <div
                  key={user.id}
                  className={`ranking-item ${getRankClass(rank)} ${currentUser?.id === user.id ? "current-user" : ""}`}
                >
                  <div className="ranking-position">
                    <span className="rank-number">{getRankIcon(rank)}</span>
                  </div>

                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <h3>
                      {user.firstName} {user.lastName}
                      {currentUser?.id === user.id && <span className="you-badge">Vous</span>}
                    </h3>
                    <p>{user.email}</p>
                  </div>

                  <div className="user-stats">
                    <div className="stat-group">
                      <div className="stat-item primary">
                        <span className="stat-number">{user.totalApplications}</span>
                        <span className="stat-label">Total</span>
                      </div>
                      <div className="stat-item success">
                        <span className="stat-number">{user.acceptedApplications}</span>
                        <span className="stat-label">Acceptées</span>
                      </div>
                      <div className="stat-item pending">
                        <span className="stat-number">{user.pendingApplications}</span>
                        <span className="stat-label">En attente</span>
                      </div>
                      <div className="stat-item rejected">
                        <span className="stat-number">{user.rejectedApplications}</span>
                        <span className="stat-label">Refusées</span>
                      </div>
                    </div>
                    <div className="success-rate">
                      <span className={`rate-value ${getSuccessRateColor(user.successRate)}`}>{user.successRate}%</span>
                      <span className="rate-label">Taux de succès</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="global-stats">
          <h2>📈 Statistiques Globales</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Utilisateurs actifs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <span className="stat-number">{users.reduce((total, user) => total + user.totalApplications, 0)}</span>
                <span className="stat-label">Candidatures totales</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">
                  {users.reduce((total, user) => total + user.acceptedApplications, 0)}
                </span>
                <span className="stat-label">Candidatures acceptées</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">
                  {users.length > 0
                    ? (
                        (users.reduce((total, user) => total + user.acceptedApplications, 0) /
                          users.reduce((total, user) => total + user.totalApplications, 0)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className="stat-label">Taux de succès moyen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking
