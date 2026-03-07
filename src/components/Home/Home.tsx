import "./Home.css";
import BusinessPerformanceAnalytics from "../../assets/icons/BusinessPerformanceAnalytics.png";
import BusinessPerformancePlanning from "../../assets/icons/BusinessPerformancePlanning.ico";
import InvoiceCapture from "../../assets/icons/InvoiceCapture.png";
import bankManage from "../../assets/icons/bankManage.png";
import employment from "../../assets/icons/employment.png";
import learning from "../../assets/icons/learning.png";
import raise from "../../assets/icons/raise.png";
import employeeSelfService from "../../assets/icons/employeeSelfService.png";

interface BodyProps {
  selectedValue: string;
}

const Home = ({ selectedValue }: BodyProps) => {
  return (
    <div className="main-content">
      <div className="image-container">
        <h1 className="overlay-text">Contoso Retail {selectedValue}</h1>
      </div>

      <div className="firstRow">
        <p className="heading">APPS</p>
        <div className="box-container">
          <div className="box">
            <img src={BusinessPerformanceAnalytics} width={40} alt="" />
            <p>Business Performance analytics</p>
          </div>

          <div className="box">
            <img src={BusinessPerformancePlanning} width={40} alt="" />
            <p>Business performance planning</p>
          </div>

          <div className="box">
            <img src={InvoiceCapture} width={40} alt="" />
            <p>Invoice Capture</p>
          </div>
        </div>
      </div>

      <div className="secondRow">
        <p className="heading">WORKSPACE</p>
        <div className="workSpaceBox">
          <div className="box">
            <img src={bankManage} width={30} alt="" />
            <p className="diff">Bank Management</p>
          </div>

          <div className="box">
            <img src={employment} width={30} alt="" />
            <p className="diff">Employee development</p>
          </div>

          <div className="box">
            <img src={learning} width={30} alt="" />
            <p className="diff">Product readiness for process manufacturing</p>
          </div>

          <div className="box">
            <img src={raise} width={30} alt="" />
            <p className="diff">Benefits</p>
          </div>

          <div className="box">
            <img src={employeeSelfService} width={30} alt="" />
            <p className="diff">Employee Self Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
