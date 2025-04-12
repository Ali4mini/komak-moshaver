const Card = (props) => {
  return (
    <div className="block border-2 shadow-md rounded-2xl bg-gray-50 hover:bg-gray-100 hover:shadow-xl mx-4 py-2 px-2">
      {props.children}
    </div>
  );
};

export default Card;
