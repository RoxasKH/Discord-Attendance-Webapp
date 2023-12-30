export function getColor(value) {
  switch(value.toString()) {
    case '0':
      return '#555555'
      break;
    case '1':
      return '#57f287'
      break;
    case '2':
      return '#fee75c'
      break;
    case '3':
      return '#ed4245'
      break;
  }
}

export function getValue(color) {
  switch(color) {
    case '#555555':
      return 0
      break;
    case '#57f287':
      return 1
      break;
    case '#fee75c':
      return 2
      break;
    case '#ed4245':
      return 3
      break;
  }
}