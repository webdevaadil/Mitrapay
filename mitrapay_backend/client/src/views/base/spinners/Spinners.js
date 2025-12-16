import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CSpinner, CRow } from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

// --- Design Constants: Vibrant Pink Theme (Applied) ---
const CUSTOM_PRIMARY = "#ff66b2"; // Vibrant Pink
const TEXT_ACCENT = "#cc4a92"; // Slightly darker pink for strong text

const Spinners = () => {
  // Common style for the orange card headers
  const orangeHeaderStyle = { 
    backgroundColor: CUSTOM_PRIMARY, 
    color: 'white',
    borderBottom: `2px solid ${TEXT_ACCENT}`
  };

  // Common style for orange primary buttons
  const orangeButtonStyle = {
    backgroundColor: CUSTOM_PRIMARY, 
    borderColor: CUSTOM_PRIMARY,
  };

  return (
    <CRow>
      <CCol xs={12}>
        <DocsComponents href="components/spinner/" />
        <CCard className="mb-4 shadow-sm">
          {/* Orange Card Header */}
          <CCardHeader style={orangeHeaderStyle}>
            <strong>React Spinner</strong> <small>Border</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              Use the border spinners for a lightweight loading indicator.
            </p>
            <DocsExample href="components/spinner">
              {/* Default spinner styled with orange */}
              <CSpinner style={{ color: CUSTOM_PRIMARY }} />
            </DocsExample>
            <p className="text-body-secondary small">
              The border spinner uses <code>currentColor</code> for its <code>border-color</code>.
              You can use any of our text color utilities on the standard spinner.
            </p>
            <DocsExample href="components/spinner#colors">
              {/* Force primary spinner to be orange, keep others as CoreUI defaults */}
              <CSpinner style={{ color: CUSTOM_PRIMARY }} />
              <CSpinner color="secondary" />
              <CSpinner color="success" />
              <CSpinner color="danger" />
              <CSpinner color="warning" />
              <CSpinner color="info" />
              <CSpinner color="light" />
              <CSpinner color="dark" />
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          {/* Orange Card Header */}
          <CCardHeader style={orangeHeaderStyle}>
            <strong>React Spinner</strong> <small>Growing</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              If you don&#39;t fancy a border spinner, switch to the grow spinner. While it
              doesn&#39;t technically spin, it does repeatedly grow!
            </p>
            <DocsExample href="components/spinner#growing-spinner">
              {/* Default grow spinner styled with orange */}
              <CSpinner variant="grow" style={{ color: CUSTOM_PRIMARY }} />
            </DocsExample>
            <p className="text-body-secondary small">
              Once again, this spinner is built with <code>currentColor</code>, so you can easily
              change its appearance. Here it is in orange, along with the supported variants.
            </p>
            <DocsExample href="components/spinner#growing-spinner">
              {/* Force primary grow spinner to be orange, keep others as CoreUI defaults */}
              <CSpinner variant="grow" style={{ color: CUSTOM_PRIMARY }} />
              <CSpinner color="secondary" variant="grow" />
              <CSpinner color="success" variant="grow" />
              <CSpinner color="danger" variant="grow" />
              <CSpinner color="warning" variant="grow" />
              <CSpinner color="info" variant="grow" />
              <CSpinner color="light" variant="grow" />
              <CSpinner color="dark" variant="grow" />
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          {/* Orange Card Header */}
          <CCardHeader style={orangeHeaderStyle}>
            <strong>React Spinner</strong> <small>Size</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              Add <code>size=&#34;sm&#34;</code> property to make a smaller spinner that can quickly
              be used within other components.
            </p>
            <DocsExample href="components/spinner#size">
              {/* Small spinners styled with orange */}
              <CSpinner size="sm" style={{ color: CUSTOM_PRIMARY }} />
              <CSpinner size="sm" variant="grow" style={{ color: CUSTOM_PRIMARY }} />
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          {/* Orange Card Header */}
          <CCardHeader style={orangeHeaderStyle}>
            <strong>React Spinner</strong> <small>Buttons</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              Use spinners within buttons to indicate an action is currently processing or taking
              place. You may also swap the text out of the spinner element and utilize button text
              as needed.
            </p>
            {/* Border Spinner Buttons (Orange) */}
            <DocsExample href="components/spinner#buttons">
              <CButton style={orangeButtonStyle} className='text-white me-2' disabled>
                <CSpinner as="span" size="sm" aria-hidden="true" />
              </CButton>
              <CButton style={orangeButtonStyle} className='text-white' disabled>
                <CSpinner as="span" size="sm" aria-hidden="true" />
                Loading...
              </CButton>
            </DocsExample>
            {/* Grow Spinner Buttons (Orange) */}
            <DocsExample href="components/spinner#buttons">
              <CButton style={orangeButtonStyle} className='text-white me-2' disabled>
                <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" />
              </CButton>
              <CButton style={orangeButtonStyle} className='text-white' disabled>
                <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" />
                Loading...
              </CButton>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Spinners