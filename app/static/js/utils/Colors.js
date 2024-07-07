export function getColor(value) {
  switch(value.toString()) {
    case '0':
      return '#555555'
    case '1':
      return '#57f287'
    case '2':
      return '#fee75c'
    case '3':
      return '#ed4245'
  }
}

export function getValue(color) {
  switch(color) {
    case '#555555':
      return 0
    case '#57f287':
      return 1
    case '#fee75c':
      return 2
    case '#ed4245':
      return 3
  }
}