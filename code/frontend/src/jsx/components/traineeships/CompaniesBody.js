const CompaniesBody = (props) => {
    return <div>
        {props.companiesData.map(company => (
            <div key={company.id}>
                <h2>{company.name}</h2>
                <p>{company.description}</p>
            </div>
        ))}
    </div>
}

export default CompaniesBody;