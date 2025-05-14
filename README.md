# Craft Form App

To run the app:

- `npm i`
- `npm run dev`

## Notes

This code is written with the specific task in mind. In a more complex / real world scenario, the code should be properly abstracted out with data manipulation and UI presentation neatly divided. This is currently not done for two reasons: time constraint and making sure the code is more quickly understandable with obvious connections between data and UI elements.

The Choices field is implemented via an editable div. This novel approach is not straightforward (the element cannot be "controlled") and is perhaps not appropriate for a real-world app, but I chose it to showcase the capabilities of the lesser-known Highlight API which in this case allows for some neat validation.

## Possible improvements

- Optimize by enabling [React compiler](https://react.dev/learn/react-compiler)
- Enhance design in mobile resolutions
- Add unit tests
- Replace built-in HTML checkbox with one from a UI library that looks closer to design
