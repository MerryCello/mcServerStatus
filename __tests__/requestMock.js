export const request = {
  get: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.5) {
          resolve({
            body: {
              ip: '129.146.83.237',
              port: 25565,
              debug: {
                ping: true,
                query: false,
                srv: false,
                querymismatch: false,
                ipinsrv: false,
                cnameinsrv: false,
                animatedmotd: false,
                cachetime: 0,
                apiversion: 2,
                dns: {error: {srv: 'timeout on read select()'}},
                error: {query: 'Failed to read from socket.'},
              },
              motd: {
                raw: ['§l§9Worlds Without End§r§r'],
                clean: ['Worlds Without End'],
                html: [
                  '<span style="color: #5555FF">Worlds Without End</span><br/><span>This Awesome!</span>',
                ],
              },
              players: {online: 159, max: 200},
              version: '1.19',
              online: true,
              protocol: 759,
              hostname: 'worldswithoutend.us.to',
              icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAQKElEQVR4Xq1baVRV1xWmaVfb1bU6rHZ1+NUWzVCTGI2aNCaNSbpsoqDGCDKDqDFqYnCeRVFixJEIiiKiAo6I4IQooMQJVBKniAqKTAKCoCYmxigcer/z3rnv3H3vfe8+8Me3xHPPsPc+++zpnOfR1tbm8aRRdqHoP+ujR++YFdizduLAZ36cE/xqdcLs0Ox9G5csuFiU6/39t3f+QMfcv9f8x4uFuQP2bIhZGD8j6NDswF43I7w8H00f2u12YtTIzGsXT71BxzwJ6Bo6ij3JMdER/f/JFLQ5Qev84X1KVymMrpoZfHDBiLeuos2gn2ZMduqKSLpeR6FrcBfKzryekTAvNmF2WHbsJJ+jlPCJAzxdCcMU9rGa8V9MGVqAtTLWRK2ouHK2F6XHXegarOLRTw9/uXHRuDRKoEDCpF6sIj+Q3f1qeFvNl8Hs1JaBLGPRWyz24+5syuDOujFT3u/Mvhj3Msta+jYr3v4+w5g7xeGs6kgQWzP5FV1/O1ja0okbHj388VeUPqvQNVhBa2vLz5Lmj8owIIhj2ehurOn0MM68EcAYhHNpjw8H/kYb7SeAuRaP6momhLbEeSOyQBOl0wp0DVZwcGvcDHkXNs3pzc7uHMy+UnbuaLIXaygMM2Wmvbh1MpTPDe04mz6YpUT21hyPvPSEyZROK9A1uELtjSvPTxjw9E9i4ayl77hktvl0OLuVH8qaTpprhQD63DocyjCGfqPIXPK2KoBJg559cKv6+jOUXlfQNbjCyql++WLRZWO6OVVdAN/LkoeykjifNgWsfIu/oSCaCoexG1sD0I/3xRhXczefCWcrxnZXhbBymn8+pdcVdA3OUHw4y18sNsHbk5Ue8HNKIFCfFyKYV3F5tQ+rOxSijkWfywm+un7QBDofxfVD/kz2NMVHsvwp3c6gazCDol5PT/ft2iwWSv+8j4a45qJwdvv4MN2u1ewN0jEmtKEqM5BD7DpF7YFgzVzK3G23j4cxaIvcvnNRH1UAM/y6N96uq/oHpd8MugYjNNws7zw3tHeFWGR+6POsschh6BoKQtnlVTYmrm3y0xBYmx1syJwVyAK4rRwbzI12rNXwpbS+YnTnBf1LFcL84W+WNdZWelI+jKBroFBUyg/hqJh8quLDr2YP1ezAtRQbYQJXE31VIUCNKWNWAcOJOWAzrqzVHhEIQ6ahZK8vmzyokyqE6b4vNVk5DroGgepr33RbMWnIMTGhYP78rg+0qq9Y6xIDFb620Y8fh+aiYYbfLYA1FdmOlNh5+r35lPa4ndv5AQONMs1x0wNy6ypLn6P8mQqgtaXlqezU5ZETvDs/kieKCunCruzX7jzQcMR8h2/us6nw1XV6A+cKpetta2EO+k3AyEjCMC9QjqhMOxKyvB0Jk1lrqy5Y0vwHISWiKnnwpIGdWEbMW6bBzU0nZxyWHcaxYgd3b7rvzlCVEciPETwG/SZwc7/WSAo0KrTCMNI8ROEt86eHD35tKgB7bK8OiP2kOyvPDTBcRKA6y9TKc1TuDGT1uXpX6AowrBXpzgUHD0LpkXHtoD9DWC7ztCnm01RDASDfjnCElmz3snd0Lg3AuYPqQfrYJRg8SpgG8T7s9gnnO0lxVTF4MHwYS79p+q0byt0otPDWEePoEcESolWZtxuXv35FJ4DMddFLhJQ2zHpNN1FDQZgwRk6JMgK0AKDtZqjaFciFS9stgNMIYVD6ka8I/rKSPovRCSBlcYSq/oWpAzQTwBqX2P18e4DdbzwaZlV4rPFYmGFkaBWIE6iHKEobqAog+bMx6ToBrJ4VckB0OEkFUNhuV6ai7mCIiPXVtisKk/Ro3NgWwNCXjncTumjx+EYvVQCrZgbnaARwYHPsbPERyInvq1Oh66n+HSIKjFFbABcnh8r4hrN/Y2vH1gKtlP7chHc1xjBny8pZXAAwCBH9PdV6HKoyN4/q3QskCqNDF7MK4ddxPmHkeKCkGCgAmR+MqTi7Lg2rE4BGuvtA3fEQtlTrEVqvXzrT22PDwrHbVNWY0JPBatLBqhAUW3A91TAqc4myDY7QFd4FSQ28CUCTKAiLjrcCmodQoLK0anxPVQioXHvMCuhZJxpojG8EEIokBeeXEkBRsyeIIU64ruQKiAXANIIiIwN3ZY0v9xRIepAqYwy8gZNs0jFWmQ9u2chtUyA2EPzO9H/5locS8j4UDbSOhwnrlYQEjIAQMCEkDCsLAkUWaITKDFuggnmqdwdp/HrZhqGcUaA0ybHjmE+O8CqdBEPoizhAWHzQhtoCaK3eY6MXR4zyJB2DFo/Zgb1qRUPlYUdkhaDCRBX5ecVO1ueFcoGAOZqtAVBJLFix3cYEdp4LTBEEkiSxFlJbwZAwkogDSDVJBbQFmsUZVpjE/Ha7oeuLoycLAQVYwe+sgB71HnHTAtQSV2Gaw/0hFaWTGQHqB9WF74b0Eb6CcQDE8Z2PswVDYAjEwM3RXanNse0WAI+BMdAEzAG7g5TbJvQQvhbmMzpKRpADo5Mp3qoAFNef47E7aWGMaNix0FHlaYfvZ+Wb/fk5F3Pgb+w2dpWqoqwBNISFSmNOaIRs1DAfaopu0RVvS6vFHNui31QFsH/T0igP3NWJhuVjumkIEarrDkA07AYfb88CqQCw4zgymB+7jaMmGzDEC2I+kfDwuqETe2MG0CDztGTUS6oASs4cedfjh/v3fhfh5dmCBlRUZDfI01GLaiYDZxQMq0GPsgtQcc78GZvx5P0UIaAv/obhEkKwHxveDr/OBdYeOpT55ZD49qlhaoo83svz8YP73/6WR4ILRvQpFVJBlVWWmL2q69biCHJwTvE3rL3qORRVF0EOokBuExTYC6OaUji0wO4dOBNGxtAFeIwh81KquHnB58LRfS+qoTAuHMWHi5lDNIP4juxx7YsB7o/B2BnbRQjaIEB5LmG8ZJVHf2gJLLvcV8QAjcrZRx8YRauaAJopH7hREnzigtVYAFkGArBbcleAyqMvvwmyF0Pl+j+Ac4+zLNsEXleMt/l0jQDsgofxQx/MTZMnM1BhAud2OgSAa3lVALirFx9oBQgMlLh5BKCu3APE4Qz78lSYM3rKEVtwtwi3d9rh9vgRQJuiHagI2e0DPwImMYkz8DhF5qUsx08VQPSH71zmAsDLDJEM6YzgSfcqOQLcCMJw2Q0ciBElbqW9rcZe6BRBEb7LmiJ2HhAewijQcgUcF9kFItJFjRO8Kkaw5Yfv7v7e49zxA4OFVFADlCXWnrQUAhOBh6gCgRDNmS+27SjOKdQagY68rogDAHxHGwTYLje4XavRy8c6MsLzJ3Le99iVuGCpaJBvepGUlLin+lyV5YtPrkEIb3HmSbBDBSJ/swdhtqqy7MZQK7AdF+t0IRCSgin5RjljTdRyjQHE/b7oaHSpaQS4Nfh1uL3anGBezMBZBpA12svmvB2EQCWh4lQYPLZXGEQfRJQYg5AZc2IuaAzaMSdsCgym1boB7IlYq3jbIFUAsZOGHNOkw9UFDsJgjODP6WQgDP4ZyQoKpSCYZ4UGtqJso021ReAjzyEMIxe2vmzOjwe+YQ46L9YSqTMuZpB1ipiB9uUJmWTXqg4HqQKY4de9wWO8dyf1sQMthmBneAk827aTcjqMf3nd3knpGkSKuTBeFhJ2D34dcYNkLLm9kJMlA+E5oKwNGtRAq8hGL7QEwM7T4wUeBb8RSIfli89yEgUaARMiQDHacQqoNYQAFQZTUH+uurbSmjye98HRwJlHX0SQGGslBoGNQT/KrBFkV4irdI+1c0fsFg1xn/ZgiJfpIAFI2uRYuISoCQohglHYDRHkyMS3w+dzIPc3en0iAN5WjntZFcD66DE7bDdCXo6i6GIlW5ILIyrzysRWjY4RSpNtAoBxhZpz/w7GT9vifBwDESvIFSJ3gXgBeQSlvyIvkC0a6Xhpphz9x5Wl53vwSDAvfc0kpVH9eCBOXxanbwDchVFZHEdJDnqgytAIen/gLujbAQClfsEfeD28a12EGgoD8dMDc0UHuTIE2PPzDhGFSM/u3tQ2CIMGN+hjD791c7gB7iFkHk5IlaA1keF7Bd+qANKWTtwoOpzY5K0ZDONlxeiZAeptr/tZmYPbBqtZnxFAK70ak2+GNi4at0UngP0py6JEBzxzpRYVfpvvoBO3ZwZYfnfeCPDLUWfuzwzxtrKcHGMA4CVhYi/HEU+LVR9dqwKorbjaBQmC6JQS+bqhR0BQgd1EhAbX48pg8boeQmI3dhSGjFejXMT+yDRhR1BtAk207sg3riiMbY56w2H8FB7rq8rUJzOqAIDMxAXqFTmwcPgL/C0vnVSGqwcSiBhRI6TtroCABhEebZchEiUzfLPbh0WHaZ/L7Fw9N1bmWSOAlpbHT21ePjlJHqCA4b1A7TFtYUMAERclTEAkM65eehgBQRAqx840x+yJDO428ZZ4vJf2Jbti55IfP370C1MBCJzM2RY+zafrHXnwrKHP8gfRdDHkA5QwSmB74gdEi64ETGt+wNfpg9lM32c0jIOX03kZwZRPUwEA95ob/rIpJiIVGiAmwvPYkylaFynqeZQ4cSvEn7oYEG8B6jM53BPqvuN2iaTYeNgBGmXtVSz+5ntNt/5G+XMpAIGS4oK+c4JfrRGToqx8LkP7VvB6mta/y1fUVtNqI4gdxlxUi2gR5ULmEM2rsMiQ16qufH3sv5QfCl2DERQJ/jXm4/5fycehTrIJjV+qT1oYhCGXoXAMKGNWIT+VlesE8PPyU1nc/c/xf05lftHY985929z4Z8qHEXQNZvjubtOfIkP+XSUWSZ37uu4oyNddqgDMHzraSmI2L2LYB++M6XwQLlX9tHkONzc7sFfd3aZ6U5Wn0DU4wzen8vvhXGEhWNhLu527SMDorTBPfCQDBjcp1wQE5EqOGS7v9ZWtPbtYeMib0u0MugZXWBc1cpeQ9sLhLzr9bRAAI6a+9VUMF+77aZgKQHv4XaTdoIq3xrSfDARqoEHQg1eulF5X0DW4QlN99d8nD+5yXyyKKMsVofiO+N6IcQr0MYvq6Jw4hoKOKYO7fAfaKL2uoGuwguP70kaJhYH48T1YQVJ/lp/4Hste2dc0aOoIbuQF8J/UFST1Y4cT+7F46a0PcCJ780hKpxXoGqxiy4qpiTIBMmI+7Or0aOAb3iPhrg7BFV54O+uPeB5z0nUEtqyYso7SZxW6BqvAs/rMddGLx3t1ekwJAlYr2Reu2aCqqDDhpSZecOMNgridkYE2fMPL9NNbB/EfTEIouK3+4hNHGUsGEpuMtVHLlBD+55Q+q9A1uIuGmvLOudtXT9saOy1xzZxh+yKkyNEO+v8OwLM1ZXFEKi40CrKSP1XWfprS4y50DR1F/s61E+W02gj4Mcbno/93QRHY/rWR4XtjxvY7O967k+YHGhT4fmxfykd0vY5C1/AkUH6p+DXFJe2e5vPiHUUYj/DzefxSfO+GmM8unTny7o8Pvv8NHYOXKhcKDw3Eq/WVU/2OzAl6pQZP+FC2X7/go/TKq+d70DFPAv8H1fgMnklMCpQAAAAASUVORK5CYII=',
            },
          });
        } else {
          reject(new Error('test error'));
        }
      }, Math.random() * (7000 - 1000 + 1) + 1000);
    }),
};
