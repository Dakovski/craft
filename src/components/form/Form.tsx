import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_FORM_VALUE,
  FORM_VALUEs_MAX_NUMBER,
} from "../../constants/form";
import type { FormProps, FormValidation } from "../../types/form";
import "./Form.scss";
import CustomButton from "../button";
import { highlight } from "../../utils";

const Form: React.FC = () => {
  const [label, setLabel] = useState(DEFAULT_FORM_VALUE.label);
  const [required, setRequired] = useState(DEFAULT_FORM_VALUE.required);
  const [initialChoices, setInitialChoices] = useState(
    DEFAULT_FORM_VALUE.choices
  );
  const [choices, setChoices] = useState(initialChoices);
  const [displayAlpha, setDisplayAlpha] = useState(
    DEFAULT_FORM_VALUE.displayAlpha
  );
  const [defaultValue, setDefaultValue] = useState(DEFAULT_FORM_VALUE.default);
  const [formValidation, setFormValidation] = useState<FormValidation>({
    hasNoLabel: false,
    hasDuplicates: false,
    hasTooLong: false,
    hasTooMany: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const requiredCheckboxId = useId();
  const displayAlphaCheckboxId = useId();

  const formValueRef = useRef<FormProps>(DEFAULT_FORM_VALUE);
  const editableDivRef = useRef<HTMLDivElement>(null);

  const onSubmit = useCallback(() => {
    if (!editableDivRef.current) {
      return;
    }

    const valueToSubmit = {
      ...formValueRef.current,
      choices: formValueRef.current.choices
        .filter((choice) => choice !== "")
        .map((choice) => choice.trim()),
    };

    const newFormValidation: FormValidation = highlight(
      editableDivRef.current,
      formValidation
    );

    newFormValidation.hasNoLabel = !valueToSubmit.label;
    newFormValidation.hasTooMany =
      valueToSubmit.choices.length > FORM_VALUEs_MAX_NUMBER;

    setFormValidation(newFormValidation);

    if (Object.values(newFormValidation).some((value) => value)) {
      console.log("Form validation failed:", newFormValidation);
      return;
    }

    console.log("Submitting form with value:", valueToSubmit);
    setIsLoading(true);

    fetch("https://run.mocky.io/v3/c7e23d3c-fb07-4046-ad40-17bfc00ef44a", {
      method: "POST",
      body: JSON.stringify(valueToSubmit),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Form submitted successfully:", data);
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formValidation]);

  const onReset = useCallback(() => {
    setLabel(DEFAULT_FORM_VALUE.label);
    setRequired(DEFAULT_FORM_VALUE.required);
    setInitialChoices(DEFAULT_FORM_VALUE.choices);
    setChoices(DEFAULT_FORM_VALUE.choices);
    setDisplayAlpha(DEFAULT_FORM_VALUE.displayAlpha);
    setDefaultValue(DEFAULT_FORM_VALUE.default);
    setFormValidation({
      hasNoLabel: false,
      hasDuplicates: false,
      hasTooLong: false,
      hasTooMany: false,
    });
    localStorage.removeItem("formValue");
  }, []);

  /* Save default value to choices (if not present already); this is done on blur or Enter key */
  const onDefaultValueSave = useCallback(() => {
    if (defaultValue) {
      if (!formValueRef.current.choices.includes(defaultValue)) {
        setChoices((prevChoices) => [...prevChoices, defaultValue]);

        if (editableDivRef.current) {
          const newItemElement = document.createElement("div");

          newItemElement.innerText = defaultValue;
          editableDivRef.current.appendChild(newItemElement);
        }
      }
    }
  }, [defaultValue]);

  /* Load form value from localStorage on component mount (if present) */
  useEffect(() => {
    const storedFormValue = localStorage.getItem("formValue");

    if (storedFormValue) {
      try {
        const parsedFormValue = JSON.parse(storedFormValue);
        const validatedFormValue = {
          ...DEFAULT_FORM_VALUE,
          ...parsedFormValue,
        };

        setLabel(validatedFormValue.label);
        setRequired(validatedFormValue.required);
        setInitialChoices(validatedFormValue.choices);
        setChoices(validatedFormValue.choices);
        setDisplayAlpha(validatedFormValue.displayAlpha);
        setDefaultValue(validatedFormValue.default);
      } catch (error) {
        console.error("Error parsing form value from localStorage:", error);
        localStorage.removeItem("formValue");
      }
    }
  }, []);

  useEffect(() => {
    formValueRef.current = {
      label,
      required,
      choices,
      displayAlpha,
      default: defaultValue,
    };

    localStorage.setItem("formValue", JSON.stringify(formValueRef.current));
  }, [label, required, choices, displayAlpha, defaultValue]);

  /* Input change handlers */
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequired(e.target.checked);
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(e.target.value);
  };

  const handleChoicesChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const choices = e.target.innerText.split("\n");

    setChoices(choices);
  };

  const handleDisplayAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayAlpha(e.target.checked);
  };

  return (
    <div className="form-container">
      <div className="form-header">Field Builder</div>
      <div className="form-content">
        <div className="form-field-name">Label*</div>
        <div>
          <input
            type="text"
            className={
              "form-field-input" +
              (formValidation.hasNoLabel ? " validation-error" : "")
            }
            placeholder="Enter label"
            value={label}
            onChange={handleLabelChange}
          />
          {formValidation.hasNoLabel && (
            <div className="form-field-validation-message">
              Label is required
            </div>
          )}
        </div>
        <div className="form-field-name">Type</div>
        <div className="form-field-types">
          <div className="form-field-type">Multi-select</div>
          <div className="form-field-settings">
            <input
              id={requiredCheckboxId}
              type="checkbox"
              checked={required}
              onChange={handleRequiredChange}
            />
            <label htmlFor={requiredCheckboxId}>A value is required</label>
          </div>
        </div>
        <div className="form-field-name">Default Value</div>
        <input
          type="text"
          className="form-field-input"
          placeholder="Enter default value"
          value={defaultValue}
          onChange={handleDefaultChange}
          onBlur={onDefaultValueSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onDefaultValueSave();
            }
          }}
        />
        <div className="form-field-name">Choices</div>
        <div>
          <div
            className={
              "form-field-input" +
              (Object.entries(formValidation)
                .filter(([key]) => key !== "hasNoLabel")
                .some(([, value]) => value)
                ? " validation-error"
                : "")
            }
            ref={editableDivRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleChoicesChange}
          >
            {initialChoices.map((choice, index) => (
              <div key={choice + index}>{choice}</div>
            ))}
          </div>

          {formValidation.hasDuplicates && (
            <div className="legend-row">
              <div
                className="legend-color"
                style={{
                  backgroundColor: "var(--form-validation-color-error)",
                }}
              ></div>
              Duplicate items found
            </div>
          )}
          {formValidation.hasTooLong && (
            <div className="legend-row">
              <div
                className="legend-color"
                style={{
                  backgroundColor: "var(--form-validation-color-length)",
                }}
              ></div>
              Too long items found
            </div>
          )}
          {formValidation.hasTooMany && (
            <div className="form-field-validation-message">
              No more than {FORM_VALUEs_MAX_NUMBER} items allowed
            </div>
          )}
        </div>
        <div className="form-field-name">Order</div>
        <div className="form-field-settings">
          <input
            id={displayAlphaCheckboxId}
            type="checkbox"
            checked={displayAlpha}
            onChange={handleDisplayAlphaChange}
          />
          <label htmlFor={displayAlphaCheckboxId}>
            Display choices in alphabetical order
          </label>
        </div>
        <div></div>
        <div className="form-footer">
          <CustomButton
            className="form-footer-button"
            onClick={onSubmit}
            isLoading={isLoading}
            disabled={isLoading}
            variant="success"
          >
            Save changes
          </CustomButton>
          or
          <button className="form-footer-button" onClick={onReset}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
