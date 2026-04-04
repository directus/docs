Functions accept a field and return a modified value. Functions can be used in any query parameter you'd normally supply a field key, including fields, aggregation, and filters.

The syntax for using a function is `function(field)`.

| Function  | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `year`    | Extract the year from a datetime/date/timestamp field             |
| `month`   | Extract the month from a datetime/date/timestamp field            |
| `week`    | Extract the week from a datetime/date/timestamp field             |
| `day`     | Extract the day from a datetime/date/timestamp field              |
| `weekday` | Extract the weekday from a datetime/date/timestamp field          |
| `hour`    | Extract the hour from a datetime/time/timestamp field             |
| `minute`  | Extract the minute from a datetime/time/timestamp field           |
| `second`  | Extract the second from a datetime/time/timestamp field           |
| `count`   | Extract the number of items from a JSON array or relational field |
| `json`    | Extract a specific value from a JSON field using path notation    |
