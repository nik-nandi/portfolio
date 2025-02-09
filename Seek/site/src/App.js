import './App.css';
import Header from './comps/header/Header';
import Console from './comps/console/Console';
import Results from './comps/results/Results';

import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import React from 'react';

function App() {

  const testRootIdeas = [{
    "Root Idea": {
      initial_query: "Test Search Query",
      "Sub Ideas": [
        {
          idea: "First Sub Idea",
          "description ": "This is a description of the first sub idea",
          url: "https://example.com/1",
          "Linked Concept": [
            {
              idea: "Related Concept 1",
              "description ": "Description of the first linked concept",
              url: "https://example.com/linked1"
            },
            {
              idea: "Related Concept 2",
              "description ": "Description of the second linked concept",
              url: "https://example.com/linked2"
            }
          ]
        },
        {
          idea: "First Sub Idea",
          "description ": "This is a description of the first sub idea",
          url: "https://example.com/1",
          "Linked Concept": [
            {
              idea: "Related Concept 1",
              "description ": "Description of the first linked concept",
              url: "https://example.com/linked1"
            },
            {
              idea: "Related Concept 2",
              "description ": "Description of the second linked concept",
              url: "https://example.com/linked2"
            }
          ]
        },
        {
          idea: "Second Sub Idea",
          "description ": "This is a description of the second sub idea",
          url: "https://example.com/2",
          "Linked Concept": [
            {
              idea: "Related Concept 3",
              "description ": "Description of the third linked concept",
              url: "https://example.com/linked3"
            }
          ]
        }
      ]
    }
  }];

  return (
    <Router>
      <div className="App">
      <Header logoSize="300px" logoColor="#000ff0" />
        <div className="content">
          <Routes>
            <Route path="/console" element={<Console/>} />
            <Route path="/" element={<Console />} />
            <Route path="/tree" element={<Results rootIdeas={testRootIdeas} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
