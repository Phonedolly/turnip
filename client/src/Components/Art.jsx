import axios from "axios";
import { useState, useEffect } from "react";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./Art.scss";

export default class Art extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      md: null,
    };
  }

  componentDidMount() {
    axios
      .get(
        "https://raw.githubusercontent.com/Phonedolly/news2atc/master/README.md"
      )
      .then((res) => {
        console.log(res);
        this.setState({ md: res.data });
      });
  }

  render() {
    const { md } = this.state;
    return (
      <ReactMarkDown
        className="article"
        children={md}
        remarkPlugins={[remarkGfm]}
      />
    );
  }
}
